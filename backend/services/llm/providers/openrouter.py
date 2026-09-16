from collections.abc import AsyncIterator
from openai import AsyncOpenAI, APIError, APITimeoutError, AuthenticationError, RateLimitError
from backend.services.llm.base import LLMProvider
from backend.services.llm.exceptions import LLMProviderError, LLMAuthenticationError, LLMRateLimitError, LLMTimeoutError


class OpenRouterProvider(LLMProvider):

    def __init__(self, api_key: str, base_url: str, model: str, timeout: int = 60):
        self.model = model

        self.client = AsyncOpenAI(api_key=api_key, base_url=base_url.rstrip("/"), timeout=timeout)
        

    async def generate(self, messages: list[dict[str, str]], model: str = None, **kwargs) -> str:
        selected_model = model or self.model

        try:
            response = await self.client.chat.completions.create(
                model=selected_model,
                messages=messages,
                **kwargs
            )
            content = response.choices[0].message.content
            if content is None:
                raise LLMProviderError("OpenRouter returned an empty response.")
            
            return content

        except (
            LLMAuthenticationError,
            LLMRateLimitError,
            LLMTimeoutError,
            LLMProviderError,
        ):
            raise

        except AuthenticationError as exc:
            raise LLMAuthenticationError(
                "Invalid OpenRouter API key."
            ) from exc

        except RateLimitError as exc:
            raise LLMRateLimitError(
                "OpenRouter rate limit exceeded."
            ) from exc

        except APITimeoutError as exc:
            raise LLMTimeoutError(
                "OpenRouter request timed out."
            ) from exc

        except APIError as exc:
            raise LLMProviderError(
                f"OpenRouter API error: {exc}"
            ) from exc

        except Exception as exc:
            raise LLMProviderError(
                f"Unexpected OpenRouter error: {exc}"
            ) from exc


    async def stream(self, messages: list[dict[str, str]], model: str = None, **kwargs) -> AsyncIterator[str]:
        selected_model = model or self.model
        try:
            async with self.client.chat.completions.stream(
                model=selected_model,
                messages=messages,
                **kwargs
            ) as stream:
                async for event in stream:
                    if event.type == "content.delta":
                        yield event.delta

        except AuthenticationError as exc:
            raise LLMAuthenticationError(
                "Invalid OpenRouter API key."
            ) from exc

        except RateLimitError as exc:
            raise LLMRateLimitError(
                "OpenRouter rate limit exceeded."
            ) from exc

        except APITimeoutError as exc:
            raise LLMTimeoutError(
                "OpenRouter streaming request timed out."
            ) from exc

        except APIError as exc:
            raise LLMProviderError(
                f"OpenRouter streaming error: {exc}"
            ) from exc

        except Exception as exc:
            raise LLMProviderError(
                f"Unexpected OpenRouter streaming error: {exc}"
            ) from exc       

        
