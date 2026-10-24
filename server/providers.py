from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass
from typing import Any, Callable
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import HTTPRedirectHandler, Request, build_opener

try:
    from server.secrets_store import read_secret
except ModuleNotFoundError:
    from secrets_store import read_secret


class ProviderError(RuntimeError):
    pass


class ProviderCancelled(ProviderError):
    pass


class _NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


@dataclass(frozen=True)
class AgentRequest:
    instruction: str
    mode: str
    target_path: str
    current_content: str
    file_summary: list[str]


@dataclass(frozen=True)
class ProviderResult:
    summary: str
    edits: list[dict[str, str]]
    input_tokens: int
    output_tokens: int
    cost_usd: float


PROVIDER_CATALOG = [
    {
        "kind": "mock",
        "label": "Deterministic Mock",
        "location": "internal",
        "capabilities": {"tool_calls": True, "vision": False, "json": True, "context_window": 8192},
    },
    {
        "kind": "ollama",
        "label": "Ollama (OpenAI-compatible)",
        "location": "local",
        "capabilities": {"tool_calls": None, "vision": None, "json": None, "context_window": None},
    },
    {
        "kind": "openai-compatible",
        "label": "OpenAI-compatible API",
        "location": "cloud",
        "capabilities": {"tool_calls": None, "vision": None, "json": True, "context_window": None},
    },
    {
        "kind": "openhands",
        "label": "OpenHands provider adapter",
        "location": "optional",
        "available": False,
        "reason": "Agent Canvas is not running in this environment.",
        "capabilities": {"tool_calls": None, "vision": None, "json": None, "context_window": None},
    },
]


def _cancelled(check_cancelled: Callable[[], bool]) -> None:
    if check_cancelled():
        raise ProviderCancelled("task cancellation requested")


def _cost(config: dict[str, Any], input_tokens: int, output_tokens: int) -> float:
    return round(
        input_tokens * float(config["input_cost_per_million"]) / 1_000_000
        + output_tokens * float(config["output_cost_per_million"]) / 1_000_000,
        8,
    )


def projected_cost(config: dict[str, Any], request: AgentRequest) -> float:
    estimated_input = max(1, (len(request.instruction) + len(request.current_content) + sum(map(len, request.file_summary))) // 4)
    if estimated_input > int(config["max_input_tokens"]):
        raise ProviderError("estimated input exceeds the provider input-token limit")
    projected = _cost(config, estimated_input, int(config["max_output_tokens"]))
    if config["kind"] == "openai-compatible" and (
        float(config["input_cost_per_million"]) <= 0 or float(config["output_cost_per_million"]) <= 0
    ):
        raise ProviderError("cloud inference requires explicit input and output pricing")
    if projected > float(config["max_cost_usd"]):
        raise ProviderError("projected request cost exceeds the configured task cap")
    return projected


class BaseProvider:
    def __init__(self, config: dict[str, Any]):
        self.config = config

    def diagnose(self) -> dict[str, Any]:
        raise NotImplementedError

    def generate(self, request: AgentRequest, check_cancelled: Callable[[], bool]) -> ProviderResult:
        raise NotImplementedError


class MockProvider(BaseProvider):
    def diagnose(self) -> dict[str, Any]:
        return {"status": "ok", "message": "Deterministic mock provider is available.", "models": [self.config["model_id"]]}

    def generate(self, request: AgentRequest, check_cancelled: Callable[[], bool]) -> ProviderResult:
        _cancelled(check_cancelled)
        summary = f"Mock analysis completed in {request.mode} mode for {request.target_path or 'project overview'}."
        edits: list[dict[str, str]] = []
        if request.mode in {"edit", "test"}:
            if not request.target_path or not request.current_content:
                raise ProviderError("mock edit mode requires a readable target file")
            marker = "\n<!-- Project Forge mock proposal; sandbox only. -->\n"
            content = request.current_content.rstrip() + marker
            edits = [{"path": request.target_path, "content": content}]
        input_tokens = max(1, (len(request.instruction) + len(request.current_content)) // 4)
        output_tokens = max(1, (len(summary) + sum(len(edit["content"]) for edit in edits)) // 4)
        return ProviderResult(summary, edits, input_tokens, output_tokens, 0.0)


class OpenAICompatibleProvider(BaseProvider):
    def _headers(self) -> dict[str, str]:
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        if self.config["kind"] == "openai-compatible":
            api_key = read_secret("FORGE_OPENAI_API_KEY")
            if not api_key:
                raise ProviderError("FORGE_OPENAI_API_KEY is not configured on the server")
            headers["Authorization"] = f"Bearer {api_key}"
        return headers

    def _request(self, path: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
        url = urljoin(self.config["base_url"].rstrip("/") + "/", path.lstrip("/"))
        data = None if payload is None else json.dumps(payload).encode()
        request = Request(url, data=data, headers=self._headers(), method="GET" if payload is None else "POST")
        try:
            with build_opener(_NoRedirect).open(request, timeout=float(self.config["timeout_seconds"])) as response:
                body = response.read(2 * 1024 * 1024)
                return json.loads(body)
        except HTTPError as exc:
            raise ProviderError(f"provider returned HTTP {exc.code}") from exc
        except URLError as exc:
            reason = getattr(exc, "reason", "connection failed")
            raise ProviderError(f"provider connection failed: {type(reason).__name__}") from exc
        except (TimeoutError, json.JSONDecodeError) as exc:
            raise ProviderError(f"provider response failed: {type(exc).__name__}") from exc

    def diagnose(self) -> dict[str, Any]:
        data = self._request("models")
        models = [item.get("id") for item in data.get("data", []) if isinstance(item, dict) and item.get("id")]
        return {"status": "ok", "message": "Provider connection succeeded.", "models": models[:100]}

    def generate(self, request: AgentRequest, check_cancelled: Callable[[], bool]) -> ProviderResult:
        projected_cost(self.config, request)
        _cancelled(check_cancelled)
        system = (
            "You are a constrained coding assistant. Return one JSON object with keys summary and edits. "
            "edits must be an array of {path, content}; use only the requested target path. "
            "Do not emit shell commands, markdown fences, credentials, or additional keys."
        )
        user = json.dumps(
            {
                "instruction": request.instruction,
                "mode": request.mode,
                "target_path": request.target_path,
                "current_content": request.current_content,
                "file_index": request.file_summary,
            },
            ensure_ascii=False,
        )
        payload = {
            "model": self.config["model_id"],
            "messages": [{"role": "system", "content": system}, {"role": "user", "content": user}],
            "temperature": 0,
            "max_tokens": int(self.config["max_output_tokens"]),
            "response_format": {"type": "json_object"},
        }
        last_error: ProviderError | None = None
        for attempt in range(int(self.config["retries"]) + 1):
            _cancelled(check_cancelled)
            try:
                data = self._request("chat/completions", payload)
                break
            except ProviderError as exc:
                last_error = exc
                if attempt >= int(self.config["retries"]):
                    raise
                time.sleep(min(2**attempt, 4))
        else:
            raise last_error or ProviderError("provider request failed")
        _cancelled(check_cancelled)
        try:
            content = data["choices"][0]["message"]["content"]
            proposal = json.loads(content)
            summary = str(proposal["summary"])
            edits = proposal.get("edits", [])
            if not isinstance(edits, list):
                raise TypeError
            clean_edits = [{"path": str(item["path"]), "content": str(item["content"])} for item in edits]
        except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
            raise ProviderError("provider did not return the required structured proposal") from exc
        usage = data.get("usage", {})
        input_tokens = int(usage.get("prompt_tokens", max(1, len(user) // 4)))
        output_tokens = int(usage.get("completion_tokens", max(1, len(content) // 4)))
        cost = _cost(self.config, input_tokens, output_tokens)
        if cost > float(self.config["max_cost_usd"]):
            raise ProviderError("reported request cost exceeded the configured task cap")
        return ProviderResult(summary[:4000], clean_edits, input_tokens, output_tokens, cost)


def build_provider(config: dict[str, Any]) -> BaseProvider:
    if config["kind"] == "mock":
        return MockProvider(config)
    if config["kind"] in {"ollama", "openai-compatible"}:
        return OpenAICompatibleProvider(config)
    raise ProviderError("provider adapter is not available")
