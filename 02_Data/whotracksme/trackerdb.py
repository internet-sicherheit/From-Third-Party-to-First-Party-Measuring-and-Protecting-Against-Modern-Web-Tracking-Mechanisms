import json
import subprocess
from pathlib import Path

class TrackerDB:
    def __init__(self, node_path="node"):
        self.node = node_path
        self.script_path = Path(__file__).parent / "trackerdb_wrapper.js"

    def _run(self, payload: dict):
        proc = subprocess.run(
            [self.node, str(self.script_path), json.dumps(payload)],
            capture_output=True,
            text=True,
            encoding="utf-8",      # <<< wichtig: UTF-8 explizit
            errors="replace",      # oder "ignore", um harte Crashes zu vermeiden
        )

        if proc.returncode != 0:
            # Hier siehst du dann ggf. Node-Fehler, wenn etwas anderes schiefläuft
            raise RuntimeError(f"Node error (exit {proc.returncode}):\n{proc.stderr}")

        if not proc.stdout:
            raise RuntimeError(
                f"No output from Node. Stderr was:\n{proc.stderr}"
            )

        return json.loads(proc.stdout)

    def match_domain(self, domain: str):
        return self._run({"type": "domain", "value": domain})

    def match_url(self, url: str, req_type="xhr", source=None):
        return self._run(
            {
                "type": "url",
                "value": url,
                "req_type": req_type,
                "source": source or url,
            }
        )
