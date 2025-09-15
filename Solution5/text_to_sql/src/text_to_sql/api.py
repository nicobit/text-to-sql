from fastapi import FastAPI
from .routes import health, users

app = FastAPI(title="text-to-sql", version="0.1.0")
app.include_router(health.router)
app.include_router(users.router)
