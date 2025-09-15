from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware
from text_to_sql.core.settings.settings import Settings

settings = Settings()

class CORSHelper:

    @staticmethod
    def set_CORS(fast_app: FastAPI):
        allowed_origins = settings.cors_allowed_origins.split(',')
        # Enable CORS (Allow only frontend domain)
        fast_app.add_middleware(
            CORSMiddleware,
            allow_origins=allowed_origins,  
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
