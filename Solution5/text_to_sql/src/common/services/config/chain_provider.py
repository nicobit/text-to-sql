from __future__ import annotations
from typing import Iterable
from .provider_base import SettingsProvider


class ChainProvider(SettingsProvider):
    """
    Try each provider in order until one succeeds.
    Example:
        ChainProvider(EnvProvider(), KeyVaultProvider(...))
    """

    def __init__(self, *providers: SettingsProvider | Iterable[SettingsProvider]):
        # allow ChainProvider([p1, p2]) as well as ChainProvider(p1, p2)
        flat: list[SettingsProvider] = []
        for p in providers:
            if isinstance(p, Iterable):
                flat.extend(p)
            else:
                flat.append(p)
        if not flat:
            raise ValueError("Need at least one provider in the chain")
        self._providers = flat

    # ---------- SettingsProvider API ----------------------------------
    def get(self, key: str):
        last_exc: KeyError | None = None
        for p in self._providers:
            try:
                return p.get(key)
            except KeyError as exc:
                last_exc = exc
        # nothing had it
        raise last_exc or KeyError(key)

    def set(self, key: str, value: str) -> None:
        # write into *first* provider that supports set()
        for p in self._providers:
            try:
                p.set(key, value)
                return
            except NotImplementedError:
                continue
        raise NotImplementedError("No writable provider found in chain")

    # ---------- helpers -----------------------------------------------
    def prepend(self, provider: SettingsProvider) -> None:
        self._providers.insert(0, provider)

    def append(self, provider: SettingsProvider) -> None:
        self._providers.append(provider)

    def __iter__(self):
        return iter(self._providers)
