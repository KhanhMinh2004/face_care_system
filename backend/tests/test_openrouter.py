import pytest

from services.llm.config import llm_settings
from services.llm.providers.openrouter import (
    OpenRouterProvider,
)


@pytest.mark.asyncio
async def test_openrouter_generate():

    provider = OpenRouterProvider(
        api_key=llm_settings.openrouter_api_key,
        base_url=llm_settings.openrouter_base_url,
        model=llm_settings.openrouter_model,
    )

    messages = [
        {
            "role": "user",
            "content": "What is RAG? Answer in one sentence.",
        }
    ]

    response = await provider.generate(messages)

    assert isinstance(response, str)
    assert len(response) > 0

    print(response)