"""ProxyFlow: a loopback-only, dependency-free public proxy workbench.
Python 3.11+, current system cURL. No subnet scanning, credentials or telemetry.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import ipaddress
import json
import math
import os
from pathlib import Path
import random
import re
import secrets
import shutil
import socket
import statistics
import subprocess
import sys
import tempfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import asdict, dataclass
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
import webbrowser

VERSION = "1.0.0-rc1"
TRACE_URL = "https://www.cloudflare.com/cdn-cgi/trace"
SPEED_URL = "https://speed.cloudflare.com/__down?bytes=1000000"
PROTOCOLS = ("http", "https", "socks4", "socks5")
BUSY = ("collecting", "testing", "benchmarking", "stopping")
MAX_BODY = 2_000_000
SOURCES = (
    {"id": "proxyscrape", "name": "ProxyScrape", "kind": "Public API", "homepage": "https://proxyscrape.com/free-proxy-list",
     "feeds": [("https://api.proxyscrape.com/v4/free-proxy-list/get?request=display_proxies&proxy_format=protocolipport&format=text&protocol=http,socks4,socks5&timeout=10000", "http")]},
    {"id": "monosans", "name": "monosans", "kind": "Community list", "homepage": "https://github.com/monosans/proxy-list",
     "feeds": [("https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/all.txt", "http")]},
    {"id": "speedx", "name": "TheSpeedX", "kind": "Community list", "homepage": "https://github.com/TheSpeedX/PROXY-List",
     "feeds": [(f"https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/{p}.txt", p) for p in ("socks5", "socks4", "http")]},
)


class Cancelled(Exception):
    pass


class ProbeError(Exception):
    def __init__(self, code: str):
        self.code = code
        super().__init__(code)


def public_ip(value: str) -> str:
    if not isinstance(value, str) or "%" in value:
        raise ValueError("Invalid IP")
    ip = ipaddress.ip_address(value)
    # IPv4-mapped addresses, transition mechanisms and private endpoints are not candidates.
    if not ip.is_global or ip.is_multicast or ip.is_unspecified or ip.is_reserved:
        raise ValueError("Only public IP addresses are accepted")
    if isinstance(ip, ipaddress.IPv6Address) and (ip.ipv4_mapped or ip.sixtofour or ip.teredo):
        raise ValueError("IPv6 transition addresses are not supported")
    return str(ip)


@dataclass(frozen=True)
class Proxy:
    protocol: str
    host: str
    port: int
    source: str = "import"

    @property
    def endpoint(self) -> str:
        return f"[{self.host}]:{self.port}" if ":" in self.host else f"{self.host}:{self.port}"

    @property
    def url(self) -> str:
        scheme = "socks5h" if self.protocol == "socks5" else self.protocol
        return f"{scheme}://{self.endpoint}"

    @property
    def id(self) -> str:
        return hashlib.sha256(self.url.encode()).hexdigest()[:20]

    def record(self) -> dict:
        return {**asdict(self), "id": self.id, "endpoint": self.endpoint, "url": self.url}


def parse_proxy(line: str, default: str = "socks5", source: str = "import") -> Proxy | None:
    if not isinstance(line, str) or len(line) > 300 or any(c.isspace() for c in line.strip()):
        return None
    text = line.strip()
    if not text or text.startswith("#"):
        return None
    try:
        u = urlsplit(text if "://" in text else f"{default}://{text}")
        protocol = "socks5" if u.scheme == "socks5h" else u.scheme
        if protocol not in PROTOCOLS or u.username is not None or u.password is not None:
            return None
        if u.path not in ("", "/") or u.query or u.fragment or not u.port:
            return None
        return Proxy(protocol, public_ip(u.hostname or ""), u.port, source)
    except (ValueError, TypeError):
        return None


def parse_list(text: str, default: str, source: str) -> list[Proxy]:
    seen: dict[str, Proxy] = {}
    for line in text.splitlines()[:50_000]:
        p = parse_proxy(line, default, source)
        if p:
            seen.setdefault(p.id, p)
    return list(seen.values())


def trace_info(body: bytes) -> dict:
    fields = dict(line.split("=", 1) for line in body.decode("utf-8", "replace").splitlines() if "=" in line)
    try:
        ip = public_ip(fields.get("ip", ""))
    except ValueError as e:
        raise ProbeError("invalid_response") from e
    country = fields.get("loc", "")
    if not re.fullmatch(r"[A-Z]{2}", country) or country in ("XX", "T1"):
        country = ""
    return {"exit_ip": ip, "country": country}


def quality_score(latency_ms: float | None, successes: int, attempts: int) -> int:
    if not successes or not attempts or latency_ms is None:
        return 0
    return round(70 * successes / attempts + 30 / (1 + latency_ms / 400))


class Gate:
    """Fixed start-rate cap shared by all proxy verification requests."""
    def __init__(self, per_second: float = 4):
        self.interval = 1 / per_second
        self.next_time = 0.0
        self.lock = threading.Lock()

    def wait(self, cancel: threading.Event):
        with self.lock:
            when = max(self.next_time, time.monotonic())
            self.next_time = when + self.interval
        if cancel.wait(max(0, when - time.monotonic())):
            raise Cancelled()


class Curl:
    """Explicit proxy routing, verified TLS, no redirects and bounded payloads."""
    def __init__(self, executable: str | None = None, ca_file: str | None = None):
        system_curl = Path(os.environ.get("SystemRoot", "C:/Windows")) / "System32/curl.exe"
        self.executable = executable or (str(system_curl) if os.name == "nt" and system_curl.exists() else shutil.which("curl"))
        if not self.executable:
            raise RuntimeError("cURL was not found. Install or update system cURL, then restart ProxyFlow.")
        self.ca_file = ca_file  # For hermetic integration tests; never accepted through the API.
        self.lock = threading.Lock()
        self.processes: set[subprocess.Popen] = set()
        self.env = {k: v for k, v in os.environ.items() if k.lower() not in
                    ("http_proxy", "https_proxy", "all_proxy", "no_proxy", "curl_ca_bundle", "ssl_cert_file", "ssl_cert_dir")}

    def check(self) -> str:
        out = subprocess.run([self.executable, "--disable", "--version"], capture_output=True,
                             text=True, timeout=5, env=self.env, creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        m = re.search(r"curl (\d+)\.(\d+)\.(\d+)", out.stdout)
        if out.returncode or not m or tuple(map(int, m.groups())) < (8, 4, 0):
            raise RuntimeError("ProxyFlow requires cURL 8.4+ for bounded streaming downloads. Update system cURL first.")
        return out.stdout.splitlines()[0]

    def stop(self):
        with self.lock:
            for p in tuple(self.processes):
                try:
                    p.kill()
                except OSError:
                    pass

    def request(self, url: str, cancel: threading.Event, proxy: Proxy | None = None,
                timeout: int = 8, max_bytes: int = 65_536) -> dict:
        if cancel.is_set():
            raise Cancelled()
        if not url.startswith("https://"):
            raise ValueError("Only fixed HTTPS targets are allowed")
        with tempfile.TemporaryDirectory(prefix="proxyflow-") as folder:
            body_file = Path(folder) / "body"
            # --disable must be the first option: ignore any ~/.curlrc.
            args = [self.executable, "--disable", "--silent", "--show-error", "--fail",
                    "--globoff", "--proto", "=https", "--tlsv1.2", "--http1.1",
                    "--connect-timeout", str(min(timeout, 5)), "--max-time", str(timeout),
                    "--max-filesize", str(max_bytes), "--max-redirs", "0",
                    "--noproxy", "", "--proxy", proxy.url if proxy else "",
                    "--user-agent", f"ProxyFlow/{VERSION}", "--output", str(body_file),
                    "--write-out", "%{http_code}|%{time_connect}|%{time_starttransfer}|%{time_total}|%{size_download}|%{speed_download}"]
            if self.ca_file:
                args += ["--cacert", self.ca_file, "--proxy-cacert", self.ca_file]
            args += ["--url", url]
            p = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=self.env,
                                 creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
            with self.lock:
                self.processes.add(p)
                if cancel.is_set():
                    p.kill()
            try:
                try:
                    stdout, _stderr = p.communicate(timeout=timeout + 3)
                except subprocess.TimeoutExpired:
                    p.kill()
                    p.communicate()
                    raise ProbeError("timeout")
                if cancel.is_set():
                    raise Cancelled()
                if p.returncode:
                    code = {5: "dns", 6: "dns", 7: "unreachable", 22: "http_error", 28: "timeout",
                            35: "tls", 51: "tls", 60: "tls", 63: "oversize", 67: "authentication",
                            97: "handshake"}.get(p.returncode, "connection_failed")
                    raise ProbeError(code)
                try:
                    status, tcp, ttfb, total, size, speed = stdout.decode("ascii").strip().split("|")
                    values = [float(v) for v in (tcp, ttfb, total, size, speed)]
                    if int(status) != 200 or not all(math.isfinite(v) and v >= 0 for v in values):
                        raise ValueError()
                    if not body_file.exists() or body_file.stat().st_size > max_bytes:
                        raise ProbeError("oversize")
                    return {"body": body_file.read_bytes(), "tcp_ms": values[0] * 1000,
                            "ttfb_ms": values[1] * 1000, "latency_ms": values[2] * 1000,
                            "size": int(values[3]), "bytes_per_second": values[4]}
                except (ValueError, UnicodeError) as e:
                    raise ProbeError("invalid_response") from e
            finally:
                with self.lock:
                    self.processes.discard(p)


class Engine:
    def __init__(self, curl: Curl):
        self.curl = curl
        self.lock = threading.RLock()
        self.cancel = threading.Event()
        self.gate = Gate()
        self.thread: threading.Thread | None = None
        self.source_cache: dict[str, tuple[float, list[Proxy]]] = {}
        self.state = self.fresh_state()

    @staticmethod
    def fresh_state() -> dict:
        return {"revision": 0, "run_id": "", "phase": "idle", "started_at": None, "finished_at": None,
                "discovered": 0, "total": 0, "checked": 0, "alive": 0, "failed": 0, "results": [],
                "sources": [{k: s[k] for k in ("id", "name", "kind", "homepage")} |
                            {"status": "idle", "count": 0, "error": "", "cached": False} for s in SOURCES],
                "logs": [], "error": "", "baseline_ip": "", "benchmark_id": ""}

    def change(self, **values):
        with self.lock:
            self.state.update(values)
            self.state["revision"] += 1

    def log(self, code: str, **details):
        with self.lock:
            self.state["logs"].append({"time": time.time(), "code": code, **details})
            self.state["logs"] = self.state["logs"][-100:]
            self.state["revision"] += 1

    def snapshot(self) -> dict:
        with self.lock:
            return copy.deepcopy(self.state)

    def source_update(self, source_id: str, **values):
        with self.lock:
            for row in self.state["sources"]:
                if row["id"] == source_id:
                    row.update(values)
            self.state["revision"] += 1

    @staticmethod
    def options(data: dict) -> dict:
        if not isinstance(data, dict):
            raise ValueError("Expected an object")
        def integer(name: str, default: int, low: int, high: int) -> int:
            v = data.get(name, default)
            if isinstance(v, bool) or not isinstance(v, int) or not low <= v <= high:
                raise ValueError(f"{name} must be between {low} and {high}")
            return v
        sources = data.get("sources", [s["id"] for s in SOURCES])
        protocols = data.get("protocols", list(PROTOCOLS))
        if not isinstance(sources, list) or any(s not in [x["id"] for x in SOURCES] for s in sources):
            raise ValueError("Unknown source")
        if not isinstance(protocols, list) or not protocols or any(p not in PROTOCOLS for p in protocols):
            raise ValueError("Choose at least one supported protocol")
        text = data.get("text", "")
        if not isinstance(text, str) or len(text) > 1_000_000:
            raise ValueError("Import is too large")
        default = data.get("default_protocol", "socks5")
        if default not in PROTOCOLS:
            raise ValueError("Invalid default protocol")
        if not sources and not text.strip():
            raise ValueError("Select a source or import public proxies")
        return {"limit": integer("limit", 300, 1, 3000), "workers": integer("workers", 12, 1, 24),
                "timeout": integer("timeout", 8, 3, 20), "samples": integer("samples", 2, 1, 3),
                "sources": sources, "protocols": protocols, "text": text, "default_protocol": default}

    def start(self, data: dict):
        options = self.options(data)
        with self.lock:
            if self.state["phase"] in BUSY:
                raise RuntimeError("A job is already running")
            self.cancel = threading.Event()
            self.gate = Gate()
            self.state = self.fresh_state() | {"run_id": secrets.token_hex(6), "phase": "collecting", "started_at": time.time()}
            self.thread = threading.Thread(target=self.run, args=(options,), daemon=True)
            self.thread.start()

    def stop(self):
        with self.lock:
            if self.state["phase"] not in BUSY:
                return
            self.cancel.set()
            self.change(phase="stopping")
        self.curl.stop()

    def collect(self, source: dict, options: dict) -> list[Proxy]:
        sid = source["id"]
        cached = self.source_cache.get(sid)
        if cached and time.time() - cached[0] < 300:
            self.source_update(sid, status="ready", count=len(cached[1]), cached=True)
            return cached[1]
        self.source_update(sid, status="fetching")
        candidates: dict[str, Proxy] = {}
        errors = []
        for url, default in source["feeds"]:
            if self.cancel.is_set():
                raise Cancelled()
            try:
                response = self.curl.request(url, self.cancel, timeout=15, max_bytes=MAX_BODY)
                for proxy in parse_list(response["body"].decode("utf-8", "replace"), default, sid):
                    candidates.setdefault(proxy.id, proxy)
            except ProbeError as e:
                errors.append(e.code)
        rows = list(candidates.values())
        if rows:
            self.source_cache[sid] = (time.time(), rows)
        self.source_update(sid, status="partial" if rows and errors else "ready" if rows else "failed",
                           count=len(rows), error=", ".join(sorted(set(errors))) or ("empty" if not rows else ""))
        self.log("source_done", source=source["name"], count=len(rows))
        return rows

    def probe(self, proxy: Proxy, options: dict) -> dict:
        readings, exits, countries, errors = [], [], [], []
        attempts = 0
        for _ in range(options["samples"]):
            self.gate.wait(self.cancel)
            attempts += 1
            try:
                r = self.curl.request(TRACE_URL, self.cancel, proxy, options["timeout"])
                info = trace_info(r["body"])
                readings.append(r)
                exits.append(info["exit_ip"])
                countries.append(info["country"])
            except ProbeError as e:
                errors.append(e.code)
                # A failed first request is not retried automatically, to avoid busy loops.
                if not readings:
                    break
        latency = round(statistics.median(r["latency_ms"] for r in readings), 1) if readings else None
        return proxy.record() | {"status": "alive" if readings else "failed", "latency_ms": latency,
            "tcp_ms": round(statistics.median(r["tcp_ms"] for r in readings), 1) if readings else None,
            "ttfb_ms": round(statistics.median(r["ttfb_ms"] for r in readings), 1) if readings else None,
            "jitter_ms": round(max(r["latency_ms"] for r in readings) - min(r["latency_ms"] for r in readings), 1) if len(readings) > 1 else None,
            "successes": len(readings), "attempts": attempts, "country": countries[-1] if countries else "",
            "exit_ip": exits[-1] if exits else "", "exit_changed": len(set(exits)) > 1,
            "same_exit": bool(exits and self.state["baseline_ip"] == exits[-1]),
            "score": quality_score(latency, len(readings), attempts), "speed_mbps": None,
            "speed_error": "", "speed_at": None, "error": errors[-1] if errors else "", "checked_at": time.time()}

    def run(self, options: dict):
        try:
            self.log("started")
            for s in SOURCES:
                if s["id"] not in options["sources"]:
                    self.source_update(s["id"], status="disabled")
            pools = [parse_list(options["text"], options["default_protocol"], "import")]
            with ThreadPoolExecutor(max_workers=3) as pool:
                jobs = [pool.submit(self.collect, s, options) for s in SOURCES if s["id"] in options["sources"]]
                for job in as_completed(jobs):
                    pools.append(job.result())
            # Mix providers fairly; do not blindly choose the first source's full list.
            for candidates in pools:
                random.SystemRandom().shuffle(candidates)
            seen: dict[str, Proxy] = {}
            for n in range(max((len(p) for p in pools), default=0)):
                for candidates in pools:
                    if n < len(candidates):
                        p = candidates[n]
                        if p.protocol in options["protocols"]:
                            seen.setdefault(p.id, p)
            if self.cancel.is_set():
                raise Cancelled()
            if not seen:
                raise ProbeError("no_candidates")
            selected = list(seen.values())[:options["limit"]]
            self.change(discovered=len(seen), total=len(selected))
            try:
                baseline = trace_info(self.curl.request(TRACE_URL, self.cancel, timeout=5)["body"])
                self.change(baseline_ip=baseline["exit_ip"])
            except ProbeError:
                self.log("baseline_unavailable")
            self.change(phase="testing")
            self.log("testing", count=len(selected))
            with ThreadPoolExecutor(max_workers=options["workers"]) as pool:
                futures = [pool.submit(self.probe, p, options) for p in selected]
                for future in as_completed(futures):
                    if self.cancel.is_set():
                        for f in futures:
                            f.cancel()
                        raise Cancelled()
                    result = future.result()
                    with self.lock:
                        self.state["results"].append(result)
                        self.state["checked"] += 1
                        self.state["alive" if result["status"] == "alive" else "failed"] += 1
                        self.state["revision"] += 1
            if self.cancel.is_set():
                raise Cancelled()
            self.change(phase="complete", finished_at=time.time())
            self.log("complete", count=self.state["alive"])
        except Cancelled:
            self.change(phase="cancelled", finished_at=time.time())
            self.log("cancelled")
        except Exception as e:
            code = e.code if isinstance(e, ProbeError) else "internal_error"
            self.change(phase="error", error=code, finished_at=time.time())
            self.log("error", error=code)

    def benchmark(self, proxy_id: str):
        with self.lock:
            if self.state["phase"] in BUSY:
                raise RuntimeError("Wait for the current job to finish")
            row = next((r for r in self.state["results"] if r["id"] == proxy_id and r["status"] == "alive"), None)
            if not row:
                raise ValueError("Select a verified proxy in the current session")
            proxy = parse_proxy(row["url"], source=row["source"])
            if not proxy:
                raise ValueError("Invalid proxy")
            previous_phase = self.state["phase"]
            self.cancel = threading.Event()
            self.change(phase="benchmarking", benchmark_id=proxy_id)
            def work():
                try:
                    r = self.curl.request(SPEED_URL, self.cancel, proxy, timeout=15, max_bytes=1_100_000)
                    if len(r["body"]) != 1_000_000 or r["size"] != 1_000_000:
                        raise ProbeError("invalid_response")
                    with self.lock:
                        row.update(speed_mbps=round(r["bytes_per_second"] * 8 / 1_000_000, 2), speed_error="", speed_at=time.time())
                    self.log("benchmark_done")
                except (ProbeError, Cancelled) as e:
                    with self.lock:
                        row.update(speed_mbps=None, speed_error=getattr(e, "code", "cancelled"), speed_at=time.time())
                except Exception:
                    with self.lock:
                        row.update(speed_mbps=None, speed_error="internal_error", speed_at=time.time())
                finally:
                    self.change(phase=previous_phase, benchmark_id="")
            self.thread = threading.Thread(target=work, daemon=True)
            self.thread.start()


class LocalServer(ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = False

    def __init__(self, address: tuple[str, int], engine: Engine, root: Path):
        self.engine, self.root = engine, root
        self.token = secrets.token_urlsafe(32)
        super().__init__(address, Handler)
        self.authority = f"127.0.0.1:{self.server_port}"
        self.origin = f"http://{self.authority}"


class Handler(BaseHTTPRequestHandler):
    server: LocalServer
    server_version = "ProxyFlow"
    sys_version = ""

    def setup(self):
        super().setup()
        self.connection.settimeout(15)

    def log_message(self, *_args):
        pass  # No browsing, proxy addresses or request bodies are logged to disk.

    def send_bytes(self, status: int, body: bytes, mime: str = "application/json; charset=utf-8"):
        self.send_response(status)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def reply(self, status: int, data: dict):
        self.send_bytes(status, json.dumps(data, ensure_ascii=False, allow_nan=False).encode("utf-8"))

    def allowed(self, token: bool = False) -> bool:
        if self.headers.get("Host") != self.server.authority:
            self.reply(403, {"error": "Invalid host. Use the local URL printed by ProxyFlow."})
            return False
        origin = self.headers.get("Origin")
        if (origin and origin != self.server.origin) or self.headers.get("Sec-Fetch-Site") == "cross-site":
            self.reply(403, {"error": "Cross-origin access is not allowed"})
            return False
        if token and not secrets.compare_digest(self.headers.get("X-ProxyFlow-Token", ""), self.server.token):
            self.reply(403, {"error": "Session expired. Reload the page."})
            return False
        return True

    def do_GET(self):
        path = urlsplit(self.path).path
        if not self.allowed(token=path.startswith("/api/") and path != "/api/session"):
            return
        if path == "/api/session":
            self.reply(200, {"name": "ProxyFlow", "version": VERSION, "token": self.server.token})
        elif path == "/api/state":
            self.reply(200, self.server.engine.snapshot())
        elif path in ("/", "/index.html", "/app.js", "/style.css", "/favicon.svg"):
            name = "index.html" if path == "/" else path[1:]
            mime = {"html": "text/html; charset=utf-8", "js": "text/javascript; charset=utf-8", "css": "text/css; charset=utf-8", "svg": "image/svg+xml"}[name.rsplit(".", 1)[1]]
            try:
                self.send_bytes(200, (self.server.root / name).read_bytes(), mime)
            except OSError:
                self.reply(404, {"error": "Application asset missing"})
        else:
            self.reply(404, {"error": "Not found"})

    def do_POST(self):
        if not self.allowed(token=True):
            return
        try:
            if self.headers.get("Transfer-Encoding"):
                raise ValueError("Chunked requests are not accepted")
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= MAX_BODY or self.headers.get("Content-Type", "").split(";")[0] != "application/json":
                raise ValueError("Expected bounded JSON body")
            body = json.loads(self.rfile.read(size))
            if not isinstance(body, dict):
                raise ValueError("Expected a JSON object")
            if self.path == "/api/scan":
                self.server.engine.start(body)
            elif self.path == "/api/stop":
                self.server.engine.stop()
            elif self.path == "/api/benchmark":
                if body.get("consent") is not True:
                    raise ValueError("A 1 MB benchmark needs explicit consent")
                self.server.engine.benchmark(body.get("id", ""))
            else:
                self.reply(404, {"error": "Not found"})
                return
            self.reply(202, {"ok": True})
        except (ValueError, TypeError, KeyError):
            self.reply(400, {"error": "Invalid request. Check the scan settings and selected proxy."})
        except RuntimeError as e:
            self.reply(409, {"error": str(e)})
        except (OSError, TimeoutError):
            self.reply(408, {"error": "Request timed out"})


def main():
    parser = argparse.ArgumentParser(description="ProxyFlow - local proxy discovery and verification")
    parser.add_argument("--port", type=int, default=8765, help="Loopback port (default 8765); use 0 for a free port")
    parser.add_argument("--no-browser", action="store_true")
    args = parser.parse_args()
    if not 0 <= args.port <= 65535:
        parser.error("Port must be between 0 and 65535")
    try:
        curl = Curl()
        curl_version = curl.check()
        root = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent)) / "web"
        engine = Engine(curl)
        try:
            server = LocalServer(("127.0.0.1", args.port), engine, root)
        except OSError:
            server = LocalServer(("127.0.0.1", 0), engine, root)
        print(f"\n  ProxyFlow {VERSION}\n  {server.origin}\n\n  {curl_version}\n  Local only. Close this window or press Ctrl+C to stop.\n", flush=True)
        if not args.no_browser:
            webbrowser.open(server.origin)
        try:
            server.serve_forever(poll_interval=0.2)
        except KeyboardInterrupt:
            pass
        finally:
            engine.stop()
            server.server_close()
    except (RuntimeError, OSError, subprocess.SubprocessError) as e:
        print(f"ProxyFlow could not start: {e}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
