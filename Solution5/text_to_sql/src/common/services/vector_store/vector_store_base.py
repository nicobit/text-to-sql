from abc import ABC, abstractmethod
from typing import Iterable, List, Dict, Sequence

class VectorStoreBase(ABC):
    """Provider-neutral contract your app will code against."""

    @abstractmethod
    def upsert(
        self, ids: Sequence[str], vectors: Sequence[Sequence[float]],
        metadata: Sequence[Dict] | None = None
    ) -> None: ...

    @abstractmethod
    def query(
        self, vector: Sequence[float], k: int = 5
    ) -> List[tuple[str, float, Dict]]: ...
