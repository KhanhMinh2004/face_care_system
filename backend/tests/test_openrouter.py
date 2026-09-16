import pytest

from backend.services.llm.config import llm_settings
from backend.services.llm.providers.openrouter import (
    OpenRouterProvider,
)


@pytest.mark.asyncio
async def test_openrouter_generate():

    provider = OpenRouterProvider(
        api_key=llm_settings.openrouter_api_key,
        base_url=llm_settings.openrouter_base_url,
        model="dots-studio/dots-3-note-preview:free",
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

@pytest.mark.asyncio
async def test_openrouter_stream():

    provider = OpenRouterProvider(
        api_key=llm_settings.openrouter_api_key,
        base_url=llm_settings.openrouter_base_url,
        model="dots-studio/dots-3-note-preview:free",
    )

    messages = [
        {
            "role": "user",
            "content": "What is RAG? Answer in one sentence.",
        }
    ]

    chunks = []

    async for chunk in provider.stream(messages):
        chunks.append(chunk)

    response = "".join(chunks)

    assert response.strip()

    print(response)