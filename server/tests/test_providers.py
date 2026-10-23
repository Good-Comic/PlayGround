import json
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from server.providers import AgentRequest, ProviderCancelled, build_provider


class FakeCompatibleHandler(BaseHTTPRequestHandler):
    requests = []

    def log_message(self, format, *args):
        return

    def _json(self, payload):
        body = json.dumps(payload).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        self._json({"data": [{"id": "fake-local-model"}]})

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        self.__class__.requests.append(json.loads(self.rfile.read(length)))
        content = json.dumps({
            "summary": "fake adapter response",
            "edits": [{"path": "README.md", "content": "changed\n"}],
        })
        self._json({
            "choices": [{"message": {"content": content}}],
            "usage": {"prompt_tokens": 11, "completion_tokens": 7},
        })


class ProviderAdapterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), FakeCompatibleHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def config(self):
        return {
            "kind": "ollama",
            "base_url": f"http://127.0.0.1:{self.server.server_port}/v1/",
            "model_id": "fake-local-model",
            "timeout_seconds": 2,
            "retries": 1,
            "max_input_tokens": 8192,
            "max_output_tokens": 256,
            "max_cost_usd": 0,
            "input_cost_per_million": 0,
            "output_cost_per_million": 0,
        }

    def request(self):
        return AgentRequest("change the readme", "edit", "README.md", "original\n", ["README.md (9 bytes)"])

    def test_openai_compatible_wire_contract(self):
        provider = build_provider(self.config())
        diagnosis = provider.diagnose()
        self.assertEqual(diagnosis["models"], ["fake-local-model"])
        result = provider.generate(self.request(), lambda: False)
        self.assertEqual(result.summary, "fake adapter response")
        self.assertEqual(result.edits[0]["path"], "README.md")
        self.assertEqual((result.input_tokens, result.output_tokens), (11, 7))
        self.assertEqual(FakeCompatibleHandler.requests[-1]["model"], "fake-local-model")

    def test_cancellation_stops_before_request(self):
        provider = build_provider(self.config())
        before = len(FakeCompatibleHandler.requests)
        with self.assertRaises(ProviderCancelled):
            provider.generate(self.request(), lambda: True)
        self.assertEqual(len(FakeCompatibleHandler.requests), before)


if __name__ == "__main__":
    unittest.main()
