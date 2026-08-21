class LLMError(Exception):
    """Base class for LLM-related exceptions."""

class LLMAuthenticationError(LLMError):
    """Exception raised for authentication errors with the LLM service."""

class LLMRateLimitError(LLMError):
    """Exception raised when the LLM service rate limit is exceeded."""

class LLMTimeoutError(LLMError):
    """Exception raised when a request to the LLM service times out."""

class LLMProviderError(LLMError):
    """Exception raised for errors related to the LLM provider."""