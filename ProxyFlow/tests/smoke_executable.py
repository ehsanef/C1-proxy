"""Start the source or packaged app and check loopback API; no public traffic."""
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request

root = Path(__file__).resolve().parents[1]
command = [str(Path(sys.argv[1]).resolve())] if len(sys.argv) > 1 else [sys.executable, str(root / "proxyflow.py")]
with socket.socket() as sock:
    sock.bind(("127.0.0.1", 0))
    port = sock.getsockname()[1]
base = f"http://127.0.0.1:{port}"
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
process = subprocess.Popen(command + ["--no-browser", "--port", str(port)], cwd=root, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
try:
    session = None
    deadline = time.monotonic() + 30
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise RuntimeError(process.stdout.read().decode("utf-8", "replace"))
        try:
            with opener.open(base + "/api/session", timeout=1) as response:
                session = json.load(response)
            break
        except (urllib.error.URLError, TimeoutError):
            time.sleep(.25)
    assert session and session["name"] == "ProxyFlow", "Application did not start"
    token = session["token"]
    request = urllib.request.Request(base + "/api/state", headers={"X-ProxyFlow-Token": token})
    with opener.open(request, timeout=3) as response:
        state = json.load(response)
    assert state["phase"] == "idle" and state["results"] == [], "Unexpected seeded results"
    for asset in ("/", "/app.js", "/style.css", "/favicon.svg"):
        with opener.open(base + asset, timeout=3) as response:
            assert response.status == 200 and len(response.read()) > 100
    try:
        opener.open(base + "/api/state", timeout=3)
    except urllib.error.HTTPError as error:
        assert error.code == 403
    else:
        raise AssertionError("API state was available without a token")
    body = json.dumps({"sources": [], "text": "127.0.0.1:80"}).encode()
    request = urllib.request.Request(base + "/api/scan", data=body, headers={"Content-Type": "application/json", "X-ProxyFlow-Token": token})
    with opener.open(request, timeout=3) as response:
        assert response.status == 202
    for _ in range(30):
        request = urllib.request.Request(base + "/api/state", headers={"X-ProxyFlow-Token": token})
        with opener.open(request, timeout=3) as response:
            state = json.load(response)
        if state["phase"] == "error":
            break
        time.sleep(.1)
    assert state["error"] == "no_candidates" and state["checked"] == 0
    print("PASS: startup, assets, token protection, private-IP rejection, no seeded results")
finally:
    if process.poll() is None:
        if os.name == "nt":
            subprocess.run(["taskkill", "/PID", str(process.pid), "/T", "/F"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=10)
        else:
            process.terminate()
    try:
        process.communicate(timeout=5)
    except subprocess.TimeoutExpired:
        process.kill()
        process.communicate()
