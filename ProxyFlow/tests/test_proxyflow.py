"""Offline regression tests. Never contacts a public proxy or website."""
import http.client
import json
from pathlib import Path
import sys
import threading
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import proxyflow as pf

BODY = b"ip=8.8.4.4\nloc=DE\ntls=TLSv1.3\n"


class ParsingTests(unittest.TestCase):
    def test_public_ipv4(self):
        self.assertEqual(pf.public_ip("8.8.8.8"), "8.8.8.8")

    def test_public_ipv6(self):
        self.assertEqual(pf.public_ip("2606:4700:4700::1111"), "2606:4700:4700::1111")

    def test_private_and_special_addresses_rejected(self):
        for value in ("127.0.0.1", "10.0.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "224.0.0.1", "198.51.100.4", "::1", "fc00::1", "fe80::1", "::ffff:8.8.8.8", "2002:0808:0808::1", "localhost"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                pf.public_ip(value)

    def test_socks5_remote_dns(self):
        p = pf.parse_proxy("socks5h://8.8.8.8:1080")
        self.assertEqual(p.protocol, "socks5")
        self.assertEqual(p.url, "socks5h://8.8.8.8:1080")

    def test_default_protocol(self):
        self.assertEqual(pf.parse_proxy("8.8.8.8:8080", "http").protocol, "http")

    def test_ipv6_brackets(self):
        self.assertEqual(pf.parse_proxy("http://[2606:4700:4700::1111]:80").endpoint, "[2606:4700:4700::1111]:80")

    def test_reject_invalid_proxy_input(self):
        for value in (None, "", "# comment", "8.8.8.8:0", "8.8.8.8:65536", "8.8.8.8:-1", "8.8.8.8", "http://u:p@8.8.8.8:80", "http://8.8.8.8:80/path", "http://8.8.8.8:80?a=1", "http://8.8.8.8:80#x", "file://8.8.8.8:80", "socks5://localhost:1080", "8.8.8.8:80 --insecure"):
            with self.subTest(value=value):
                self.assertIsNone(pf.parse_proxy(value))

    def test_deduplication_preserves_protocol(self):
        rows = pf.parse_list("8.8.8.8:80\n8.8.8.8:80\nhttp://8.8.8.8:80\n127.0.0.1:80", "socks5", "test")
        self.assertEqual(len(rows), 2)
        self.assertNotEqual(rows[0].id, rows[1].id)

    def test_trace(self):
        self.assertEqual(pf.trace_info(BODY), {"exit_ip": "8.8.4.4", "country": "DE"})

    def test_unknown_country_not_invented(self):
        self.assertEqual(pf.trace_info(b"ip=8.8.4.4\nloc=XX")["country"], "")

    def test_reject_invalid_trace(self):
        for body in (b"<html>blocked</html>", b"ip=127.0.0.1\nloc=US", b"ip=invalid"):
            with self.assertRaises(pf.ProbeError):
                pf.trace_info(body)

    def test_score_formula(self):
        self.assertEqual(pf.quality_score(None, 0, 1), 0)
        self.assertEqual(pf.quality_score(400, 2, 2), 85)
        self.assertEqual(pf.quality_score(400, 1, 2), 50)

    def test_options_bounds(self):
        for options in ({"workers": 25}, {"limit": 3001}, {"limit": True}, {"timeout": 2}, {"samples": 4}, {"sources": ["unknown"]}, {"protocols": []}, {"sources": []}, []):
            with self.subTest(options=options), self.assertRaises(ValueError):
                pf.Engine.options(options)


class FakeCurl:
    def __init__(self):
        self.fail = False
        self.calls = []

    def request(self, url, cancel, proxy=None, timeout=8, max_bytes=65536):
        self.calls.append((url, proxy))
        if cancel.is_set():
            raise pf.Cancelled()
        if self.fail and proxy:
            raise pf.ProbeError("timeout")
        if url == pf.SPEED_URL:
            return {"body": b"x" * 1_000_000, "size": 1_000_000, "bytes_per_second": 500_000}
        return {"body": BODY, "tcp_ms": 20.5, "ttfb_ms": 98, "latency_ms": 100.5, "size": len(BODY), "bytes_per_second": 1000}

    def stop(self):
        pass


class EngineTests(unittest.TestCase):
    def setUp(self):
        self.curl = FakeCurl()
        self.engine = pf.Engine(self.curl)
        self.gate = patch.object(pf.Gate, "wait", lambda _, cancel: None)
        self.gate.start()

    def tearDown(self):
        self.engine.stop()
        if self.engine.thread:
            self.engine.thread.join(5)
        self.gate.stop()

    def wait(self):
        self.engine.thread.join(5)
        self.assertFalse(self.engine.thread.is_alive())
        return self.engine.snapshot()

    def test_no_demo_results(self):
        self.assertEqual(self.engine.snapshot()["results"], [])
        self.assertEqual(self.engine.snapshot()["phase"], "idle")

    def test_import_samples_and_counts(self):
        self.engine.start({"sources": [], "text": "8.8.8.8:1080\n8.8.8.8:1080\n127.0.0.1:80", "samples": 3})
        s = self.wait()
        self.assertEqual((s["phase"], s["discovered"], s["checked"], s["alive"]), ("complete", 1, 1, 1))
        r = s["results"][0]
        self.assertEqual((r["successes"], r["attempts"], r["country"]), (3, 3, "DE"))
        self.assertIsNone(r["speed_mbps"])
        self.assertTrue(r["same_exit"])

    def test_first_failure_not_retried(self):
        self.curl.fail = True
        self.engine.start({"sources": [], "text": "8.8.8.8:1080", "samples": 3})
        s = self.wait()
        self.assertEqual((s["alive"], s["failed"]), (0, 1))
        self.assertEqual(s["results"][0]["attempts"], 1)
        self.assertIsNone(s["results"][0]["latency_ms"])

    def test_private_import_does_not_contact_network(self):
        self.engine.start({"sources": [], "text": "127.0.0.1:80"})
        s = self.wait()
        self.assertEqual(s["error"], "no_candidates")
        self.assertEqual(self.curl.calls, [])

    def test_benchmark_explicit_and_routed(self):
        self.engine.start({"sources": [], "text": "8.8.8.8:1080"})
        s = self.wait()
        self.assertFalse(any(url == pf.SPEED_URL for url, _ in self.curl.calls))
        self.engine.benchmark(s["results"][0]["id"])
        s = self.wait()
        self.assertEqual(s["results"][0]["speed_mbps"], 4.0)
        self.assertIsNotNone(next(p for url, p in self.curl.calls if url == pf.SPEED_URL))

    def test_unknown_benchmark_rejected(self):
        with self.assertRaises(ValueError):
            self.engine.benchmark("unknown")


class APITests(unittest.TestCase):
    def setUp(self):
        self.engine = pf.Engine(FakeCurl())
        self.server = pf.LocalServer(("127.0.0.1", 0), self.engine, Path(__file__).resolve().parents[1] / "web")
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self):
        self.engine.stop()
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(3)

    def request(self, path, method="GET", body=None, headers=None):
        c = http.client.HTTPConnection("127.0.0.1", self.server.server_port, timeout=3)
        c.request(method, path, body, headers or {})
        r = c.getresponse()
        out = r.status, dict(r.getheaders()), r.read()
        c.close()
        return out

    def test_session_and_token(self):
        status, _, body = self.request("/api/session")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(body)["token"], self.server.token)
        self.assertEqual(self.request("/api/state")[0], 403)
        self.assertEqual(self.request("/api/state", headers={"X-ProxyFlow-Token": self.server.token})[0], 200)

    def test_host_rebinding_rejected(self):
        self.assertEqual(self.request("/api/session", headers={"Host": "attacker.example"})[0], 403)

    def test_cross_origin_rejected(self):
        self.assertEqual(self.request("/api/session", headers={"Origin": "https://attacker.example"})[0], 403)
        self.assertEqual(self.request("/api/session", headers={"Sec-Fetch-Site": "cross-site"})[0], 403)

    def test_static_security_headers_and_whitelist(self):
        status, headers, body = self.request("/")
        self.assertEqual(status, 200)
        self.assertIn(b"ProxyFlow", body)
        self.assertIn("frame-ancestors 'none'", headers["Content-Security-Policy"])
        self.assertEqual(self.request("/proxyflow.py")[0], 404)
        self.assertEqual(self.request("/../proxyflow.py")[0], 404)

    def test_post_auth_and_consent(self):
        self.assertEqual(self.request("/api/scan", "POST", "{}", {"Content-Type": "application/json"})[0], 403)
        headers = {"X-ProxyFlow-Token": self.server.token, "Content-Type": "application/json"}
        self.assertEqual(self.request("/api/benchmark", "POST", '{"id":"x"}', headers)[0], 400)
        self.assertEqual(self.request("/api/scan", "POST", '{"workers":999}', headers)[0], 400)


if __name__ == "__main__":
    unittest.main(verbosity=2)
