import time, uuid

class TraceEvent:
    def __init__(self, comp, act, inp=None, out=None, status="success"):
        self.id = str(uuid.uuid4())
        self.timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        self.component = comp
        self.action = act
        self.input = inp
        self.output = out
        self.status = status

class Trace:
    def __init__(self):
        self.events = []
    def log(self, ev: TraceEvent):
        self.events.append(ev.__dict__)
    def to_dict(self):
        return {"trace": self.events}