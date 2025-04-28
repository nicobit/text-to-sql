import redis, json
from agentic_mesh.config import REDIS_CONN

class SessionStore:
    def __init__(self):
        self.client = redis.from_url(REDIS_CONN, decode_responses=True)

    def get(self, sid):
        data = self.client.get(f"session:{sid}")
        return json.loads(data) if data else []

    def append(self, sid, msg):
        hist = self.get(sid)
        hist.append(msg)
        self.client.set(f"session:{sid}", json.dumps(hist), ex=3600)