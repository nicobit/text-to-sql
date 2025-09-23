# Configuring Azure Entra ID App Registrations for SPA → API Authentication

This guide explains how to set up **Azure Entra ID App Registrations** so that a **React Single Page Application (SPA)** can log in a user and obtain an access token, which can then be used to authenticate requests to a protected **API**.

---

## 1. Register the API Application

1. Navigate to **Entra ID → App registrations → New registration**.
   - **Name**: `MyApi`
   - **Supported account types**: typically “Single tenant” (adjust if needed).
2. Go to **Expose an API**:
   - Set the **Application ID URI** (example: `api://<API-APP-ID>`).
   - Click **Add a scope**:
     - **Scope name**: `user_impersonation`
     - **Who can consent**: Admins and users
     - **Display name**: `Access API as user`
     - **Description**: `Allows the app to call the API on your behalf.`
     - **State**: Enabled
   - Save the scope.
3. (Recommended) Under **Authorized client applications**, add the **SPA App (Client) ID** and select the `user_impersonation` scope to pre-authorize the SPA.

---

## 2. Register the React SPA Application

1. Go to **App registrations → New registration**.
   - **Name**: `MySpa`
   - **Supported account types**: match the API registration.
2. Under **Authentication**:
   - **Add a platform** → **Single-page application**.
   - Add redirect URIs:
     - `http://localhost:3000`
     - Your production URL(s).
   - Enable **Authorization code flow with PKCE** (default for SPAs).
3. Under **API permissions**:
   - **Add a permission** → **My APIs** → select `MyApi`.
   - Choose the **Delegated permission** `user_impersonation`.
   - Click **Grant admin consent** for your tenant.

---

## 3. Scope String to Use

In your SPA, request the following scope:
```
api://<API-APP-ID>/user_impersonation
```
> Replace `<API-APP-ID>` with the Application (client) ID of your API registration, or the full custom App ID URI you defined under **Expose an API**.

---

## 4. Frontend (React + MSAL) Setup

Install MSAL:
```bash
npm install @azure/msal-browser
```

Configure MSAL:
```typescript
// msal.ts
import { PublicClientApplication } from "@azure/msal-browser";

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: "<SPA-APP-CLIENT-ID>",
    authority: "https://login.microsoftonline.com/<TENANT-ID>",
    redirectUri: "http://localhost:3000",
  },
  cache: {
    cacheLocation: "localStorage",
  },
});

const loginRequest = {
  scopes: ["api://<API-APP-ID>/user_impersonation"],
};

export async function getAccessToken() {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    await msalInstance.loginPopup(loginRequest); // or loginRedirect
  }
  const account = msalInstance.getAllAccounts()[0];
  const result = await msalInstance.acquireTokenSilent({
    account,
    scopes: ["api://<API-APP-ID>/user_impersonation"],
  });
  return result.accessToken;
}
```

Use the token in an API call:
```typescript
const token = await getAccessToken();
const res = await fetch("https://your-api.example.com/endpoint", {
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## 5. Backend (API) Token Validation

Validate tokens issued by Entra ID:

- **aud (audience)** must equal: `api://<API-APP-ID>`
- **iss (issuer)** must equal: `https://login.microsoftonline.com/<TENANT-ID>/v2.0`
- Signature must match the tenant JWKS.

**FastAPI (Python) example**:
```python
from fastapi import FastAPI, Header, HTTPException, Depends
import jwt
import requests

TENANT_ID = "<TENANT-ID>"
AUDIENCE = "api://<API-APP-ID>"
ISSUER = f"https://login.microsoftonline.com/{TENANT_ID}/v2.0"
JWKS_URL = f"https://login.microsoftonline.com/{TENANT_ID}/discovery/v2.0/keys"

jwks = requests.get(JWKS_URL).json()

def verify_token(auth: str = Header(..., alias="Authorization")):
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "Missing bearer token")
    token = auth.split(" ", 1)[1]
    header = jwt.get_unverified_header(token)
    key = next(k for k in jwks["keys"] if k["kid"] == header["kid"])
    try:
        payload = jwt.decode(
            token,
            jwt.algorithms.RSAAlgorithm.from_jwk(key),
            algorithms=["RS256"],
            audience=AUDIENCE,
            issuer=ISSUER,
        )
        return payload
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {e}")

app = FastAPI()

@app.get("/endpoint")
def endpoint(user=Depends(verify_token)):
    return {"hello": user.get("name")}
```

---

## 6. Sequence Diagram (Mermaid)

```mermaid
sequenceDiagram
  autonumber
  participant U as User (Browser)
  participant SPA as React SPA
  participant IDP as Entra ID (Auth)
  participant API as Protected API

  U->>SPA: Navigate / Login
  SPA->>IDP: authorize (PKCE, scope: api://&lt;API-APP-ID&gt;/user_impersonation)
  IDP-->>SPA: auth code
  SPA->>IDP: token request (code + PKCE verifier)
  IDP-->>SPA: ID token + Access token (aud=api://&lt;API-APP-ID&gt;)
  SPA->>API: GET /endpoint (Authorization: Bearer &lt;access_token&gt;)
  API->>IDP: Fetch JWKS (if needed)
  API->>API: Validate signature, iss, aud
  API-->>SPA: 200 OK (JSON)
```

---

## 7. Common Gotchas

- **Scope mismatch**: SPA must request the exact scope string defined in **Expose an API**.
- **`.default` scopes**: Do not use from SPAs (for client credentials, not delegated user flows).
- **Audience mismatch**: Backend must validate `aud = api://<API-APP-ID>` (or your custom App ID URI).
- **CORS**: Allow SPA origins in your API hosting (Azure Functions/App Service).
- **Consent**: Use **Authorized client applications** + **Grant admin consent** to avoid repeated prompts.

---

## 8. Copy-Paste Checklist

- [ ] API app created, **Expose an API** set, `user_impersonation` scope enabled.
- [ ] SPA app created, **SPA platform** with redirect URIs, PKCE enabled.
- [ ] SPA **API permission** added (`user_impersonation`) and **admin consent** granted.
- [ ] SPA requests scope: `api://<API-APP-ID>/user_impersonation`.
- [ ] API validates tokens with correct `iss`, `aud`, and JWKS signature.
- [ ] CORS configured for SPA origins.

---

### Summary

- **API app** defines a delegated scope.
- **SPA app** requests that scope using MSAL.
- **API** validates Entra-issued access tokens.
