from abc import ABC, abstractmethod
from collections.abc import AsyncIterator


class LLMProvider(ABC):

    @abstractmethod
    async def generate(self, messages: list[dict[str, str]], **kwargs) -> str:
        """Generate a response based on the provided messages."""
        raise NotImplementedError

    @abstractmethod
    async def stream(self, messages: list[dict[str, str]], **kwargs) ->AsyncIterator[str]:
        """Stream a response based on the provided messages."""
        raise NotImplementedError