from collections.abc import AsyncIterator
import httpx
from backend.services.llm.base import LLMProvider
from backend.services.llm.exceptions import LLMProviderError, LLMAuthenticationError, LLMRateLimitError, LLMTimeoutError


class OpenRouterProvider(LLMProvider):

    def __init__(self, api_key: str, base_url: str, model: str, timeout: int = 60):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
        self.timeout = timeout

    @property
    def headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def generate(self, messages: list[dict[str, str]], model: str = None, **kwargs) -> str:
        selected_model = model or self.model
        payload = {
            "model": selected_model,
            "messages": messages,
            "stream": False,
            **kwargs
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(f"{self.base_url}/chat/completions", json=payload, headers=self.headers)

        except httpx.TimeoutException as exc:
            raise LLMTimeoutError(f"Request to OpenRouter timed out: {exc}") from exc
        except httpx.RequestError as exc:
            raise LLMProviderError(f"An error occurred while requesting OpenRouter: {exc}") from exc
        
        if response.status_code == 401:
            raise LLMAuthenticationError(
                "Invalid OpenRouter API key."
            )

        if response.status_code == 429:
            raise LLMRateLimitError(
                "OpenRouter rate limit exceeded."
            )

        if response.status_code >= 400:
            raise LLMProviderError(
                f"OpenRouter returned "
                f"{response.status_code}: {response.text}"
            )

        try:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError) as exc:
            raise LLMProviderError("invalid response format from OpenRouter") from exc


    async def stream(self, messages: list[dict[str, str]], **kwargs) -> AsyncIterator[str]:
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": True,
            **kwargs
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                async with client.stream("POST", f"{self.base_url}/chat/completions", json=payload, headers=self.headers) as response:

                    if response.status_code == 401:
                        raise LLMAuthenticationError(
                            "Invalid OpenRouter API key."
                        )

                    if response.status_code == 429:
                        raise LLMRateLimitError(
                            "OpenRouter rate limit exceeded."
                        )

                    if response.status_code >= 400:
                        body = await response.aread()

                        raise LLMProviderError(
                            f"OpenRouter returned "
                            f"{response.status_code}: {body.decode()}"
                            f"{body.decode(errors='ignore')}"
                        )

                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue

                        data = line.removeprefix("data: ").strip()
                        if data == "[DONE]":
                            break

                        try:
                            chunk = (__import__("json")).loads(data)
                            delta = chunk["choices"][0]["delta"].get("content")
                            if delta:
                                yield delta

                        except (ValueError, KeyError, IndexError, TypeError): 
                            continue
                        
        except httpx.TimeoutException as exc:
            raise LLMTimeoutError(
                "OpenRouter streaming request timed out."
            ) from exc

        except httpx.RequestError as exc:
            raise LLMProviderError(
                f"OpenRouter streaming request failed: {exc}"
            ) from exc
