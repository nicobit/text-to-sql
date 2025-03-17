

import requests
import os

import base64
import json


# Azure AD config
TENANT_ID = os.getenv("AZURE_AD_TENANT_ID")
CLIENT_ID = os.getenv("AZURE_AD_CLIENT_ID")  # App ID of the backend API
# Fetch Azure AD public keys for token signature verification
jwks_url = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"
jwks_keys = requests.get(jwks_url).json()["keys"]


def verify_jwt(token: str):
    # Split the JWT into its parts (header, payload, signature)
    try:
        # JWT parts are separated by '.'
        header_b64, payload_b64, signature_b64 = token.split('.')

        # Add padding to Base64 URL encoded string if necessary
        header_b64 = header_b64 + '=' * (4 - len(header_b64) % 4)
        payload_b64 = payload_b64 + '=' * (4 - len(payload_b64) % 4)

        # Decode the Base64 URL encoded parts
        header = base64.urlsafe_b64decode(header_b64).decode('utf-8')
        payload = base64.urlsafe_b64decode(payload_b64).decode('utf-8')

        # Parse the decoded JSON strings into Python dictionaries
        header_json = json.loads(header)
        payload_json = json.loads(payload)

        # Return the claims (the decoded payload)
        return payload_json

    except Exception as ex:
        
        print(f"Error decoding JWT: {str(ex)}")
        return None


