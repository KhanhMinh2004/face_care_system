import os
from backend.services.llm.config import llm_settings
from backend.services.llm.providers.openrouter import OpenRouterProvider
from backend.services.llm.model_router import ModelRouter
from backend.services.llm.model_registry import FREE_MODELS

def create_llm_router() -> ModelRouter:
    api_key = llm_settings.openrouter_api_key

    if not api_key:
        raise ValueError(
            "OpenRouter API key is not set. "
            "Please set the OPENROUTER_API_KEY environment variable."
        )

    provider = OpenRouterProvider(
        api_key=api_key,
        base_url=llm_settings.openrouter_base_url,
        model=FREE_MODELS[0],
    )

    return ModelRouter(
        provider=provider,
        models=FREE_MODELS,
    )