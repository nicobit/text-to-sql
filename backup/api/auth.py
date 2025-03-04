from fastapi.security import OAuth2AuthorizationCodeBearer, HTTPBearer
import jwt
import requests

# Configure the OAuth2 scheme (if we were to use FastAPI's OAuth2 dependency flow)
# But since the token comes from front-end, we can use HTTPBearer and verify manually.
oauth2_scheme = HTTPBearer()  # just to extract "Authorization: Bearer ..." header

# Azure AD config
TENANT_ID = os.getenv("AZURE_AD_TENANT_ID")
CLIENT_ID = os.getenv("AZURE_AD_CLIENT_ID")  # App ID of the backend API
# Fetch Azure AD public keys for token signature verification
jwks_url = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"
jwks_keys = requests.get(jwks_url).json()["keys"]

def verify_jwt(token: str):
    # remove "Bearer " prefix if present
    if token.lower().startswith("bearer "):
        token = token[len("bearer "):]
    # Verify token signature and audience
    try:
        # In production, cache the JWKS and handle key rollover
        kid = jwt.get_unverified_header(token)["kid"]
        key = next(key for key in jwks_keys if key["kid"] == kid)
        public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
        claims = jwt.decode(token, public_key, algorithms=["RS256"], audience=CLIENT_ID, issuer=f"https://login.microsoftonline.com/{TENANT_ID}/v2.0")
        return claims  # if valid
    except Exception as ex:
        # Token invalid or expired
        return None