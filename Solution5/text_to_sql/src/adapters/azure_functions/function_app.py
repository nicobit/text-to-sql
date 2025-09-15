import azure.functions as func                     # >=3.4
from app.api import app as fastapi_app

# The Functions runtime sees `app` as the Function entry-point
app = func.AsgiFunctionApp(
    app=fastapi_app,
    http_auth_level=func.AuthLevel.ANONYMOUS
)
