import requests
import uvicorn
from .base import BaseAgent
from agentic_mesh.registry import register_agent

@register_agent
class TranslateTextAgent(BaseAgent):
    name = "TranslateText"
    description = "Translate text via LibreTranslate"
    schema = {
      "type":"object",
      "properties":{
        "text":{"type":"string"},
        "targetLang":{"type":"string"}
      },
      "required":["text","targetLang"]
    }

    def execute(self, text: str, targetLang: str) -> dict:
        resp = requests.post(
            "https://libretranslate.de/translate",
            json={"q": text, "source": "en", "target": targetLang},
            timeout=5
        )
        return {"translatedText": resp.json()["translatedText"]}

if __name__ == "__main__":
    uvicorn.run(TranslateTextAgent().serve(), host="0.0.0.0", port=8080)