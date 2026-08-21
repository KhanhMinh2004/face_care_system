from backend.services.llm.config import llm_settings
from backend.services.llm.providers.openrouter import OpenRouterProvider

def create_llm_provider() -> OpenRouterProvider:
    return OpenRouterProvider(
        api_key=llm_settings.openrouter_api_key,
        base_url=llm_settings.openrouter_base_url,
        model=llm_settings.openrouter_model
    )