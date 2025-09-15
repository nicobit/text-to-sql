import redis
import json

class RedisMemory:
    def __init__(self, host="localhost", port=6379):
        self.r = redis.Redis(host=host, port=port, decode_responses=True)

    def store(self, key: str, data: dict):
        self.r.set(key, json.dumps(data))

    def retrieve(self, key: str):
        value = self.r.get(key)
        return json.loads(value) if value else None

    def search(self, prefix: str):
        keys = self.r.keys(f"{prefix}*")
        return [self.retrieve(k) for k in keys]
    