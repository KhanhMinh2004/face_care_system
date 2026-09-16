from backend.services.llm.base import LLMProvider
from backend.services.llm.exceptions import (
    LLMProviderError,
    LLMAuthenticationError,
    LLMRateLimitError,
    LLMTimeoutError,
)
from collections.abc import AsyncIterator


class ModelRouter:

    def __init__(
        self,
        provider: LLMProvider,
        models: list[str],
    ):
        self.provider = provider
        self.models = models

    async def generate(
        self,
        messages: list[dict[str, str]],
        **kwargs,
    ) -> str:

        last_error = None

        for model in self.models:

            try:
                print(
                    f"[ModelRouter] Trying model: {model}"
                )

                response = await self.provider.generate(
                    messages,
                    model=model,
                    **kwargs,
                )

                print(
                    f"[ModelRouter] Model succeeded: {model}"
                )

                return response

            except LLMAuthenticationError:
                # API key sai → không thử model khác
                raise

            except (
                LLMRateLimitError,
                LLMTimeoutError,
                LLMProviderError,
            ) as exc:

                last_error = exc

                print(
                    f"[ModelRouter] Model {model} failed: "
                    f"{exc}"
                )

                continue

        raise LLMProviderError(
            f"All models failed. Last error: {last_error}"
        )

    async def stream(
        self,
        messages: list[dict[str, str]],
        **kwargs,
    ) -> AsyncIterator[str]:

        last_error = None

        for model in self.models:

            try:
                print(
                    f"[ModelRouter] Trying model: {model}"
                )

                async for chunk in self.provider.stream(
                    messages,
                    model=model,
                    **kwargs,
                ):
                    yield chunk

                print(
                    f"[ModelRouter] Model succeeded: {model}"
                )

                return

            except LLMAuthenticationError:
                # API key sai → không thử model khác
                raise

            except (
                LLMRateLimitError,
                LLMTimeoutError,
                LLMProviderError,
            ) as exc:

                last_error = exc

                print(
                    f"[ModelRouter] Model {model} failed: "
                    f"{exc}"
                )

                continue

        raise LLMProviderError(
            f"All models failed. Last error: {last_error}"
        )