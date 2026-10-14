from __future__ import annotations

from collections import defaultdict, deque
from datetime import datetime, timedelta
from threading import Lock


class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int = 60) -> None:
        self.max_requests = max(1, max_requests)
        self.window = timedelta(seconds=max(1, window_seconds))
        self._hits: dict[str, deque[datetime]] = defaultdict(deque)
        self._lock = Lock()

    def allow(self, key: str) -> bool:
        now = datetime.utcnow()
        cutoff = now - self.window
        with self._lock:
            queue = self._hits[key]
            while queue and queue[0] < cutoff:
                queue.popleft()
            if len(queue) >= self.max_requests:
                return False
            queue.append(now)
            return True
