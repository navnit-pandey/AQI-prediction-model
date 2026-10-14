from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from threading import Lock
from typing import Generic, TypeVar

T = TypeVar("T")


@dataclass
class _CacheEntry(Generic[T]):
    expires_at: datetime
    value: T


class TTLCache(Generic[T]):
    def __init__(self) -> None:
        self._store: dict[str, _CacheEntry[T]] = {}
        self._lock = Lock()

    def get(self, key: str) -> T | None:
        with self._lock:
            entry = self._store.get(key)
            if not entry:
                return None
            if datetime.utcnow() >= entry.expires_at:
                self._store.pop(key, None)
                return None
            return entry.value

    def set(self, key: str, value: T, ttl_seconds: int) -> None:
        with self._lock:
            self._store[key] = _CacheEntry(
                expires_at=datetime.utcnow() + timedelta(seconds=max(1, ttl_seconds)),
                value=value,
            )
