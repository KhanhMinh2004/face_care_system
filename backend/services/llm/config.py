from pydantic_settings import BaseSettings, SettingsConfigDict

class LLMConfig(BaseSettings):
    openrouter_api_key: str
    openrouter_base_url: str 

    model_config = SettingsConfigDict(
        env_file=".env.dev",
        env_file_encoding="utf-8",
        extra="ignore"
        )

llm_settings = LLMConfig()