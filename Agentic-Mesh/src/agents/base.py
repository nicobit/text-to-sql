from abc import ABC, abstractmethod
from fastapi import FastAPI
from pydantic import BaseModel

class ArgsModel(BaseModel):
    pass

class AgentResult(BaseModel):
    result: dict

class BaseAgent(ABC):
    name: str
    description: str
    schema: dict

    @abstractmethod
    def execute(self, **kwargs) -> dict:
        ...

    def serve(self):
        app = FastAPI()

        @app.get("/capabilities")
        def caps():
            return {"name": self.name, "description": self.description, "schema": self.schema}

        @app.post("/invoke")
        def invoke(args: dict):
            return AgentResult(result=self.execute(**args))

        return app