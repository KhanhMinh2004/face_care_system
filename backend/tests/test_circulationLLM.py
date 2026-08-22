import pytest

from backend.services.llm.factory import create_llm_router


@pytest.mark.asyncio
async def test_model_router():

    router = create_llm_router()

    messages = [
        {
            "role": "user",
            "content": "Say hello in one sentence.",
        }
    ]

    response = await router.generate(messages)

    assert isinstance(response, str)
    assert response.strip()