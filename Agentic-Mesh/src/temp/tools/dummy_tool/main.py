from fastapi import FastAPI

app = FastAPI()

@app.get("/echo")
def echo(text: str):
    return {"response": text}