Here are the 4 most common ways to get a **Bearer (AAD) access token in Python** for your proxy’s **AUDIENCE** (e.g., `api://<your-api-app-id>`). Pick the flow that matches your app / case.

---

# 1) Backend-to-backend (daemon) — **Client credentials** (service principal)

Use this when your caller is a server app (no user). You’ll need a client (app) registration with a **client secret** (or certificate) and your API exposes **application permissions** (or at least accepts `.default`).

```python
# pip install msal
import msal
import os

TENANT_ID = os.environ["TENANT_ID"]
CLIENT_ID = os.environ["CLIENT_ID"]              # caller app reg (confidential client)
CLIENT_SECRET = os.environ["CLIENT_SECRET"]
API_APP_ID_URI = os.environ["API_APP_ID_URI"]    # e.g. "api://00000000-0000-0000-0000-000000000000"

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
SCOPES = [f"{API_APP_ID_URI}/.default"]          # request the API's application permissions

app = msal.ConfidentialClientApplication(
    client_id=CLIENT_ID,
    client_credential=CLIENT_SECRET,
    authority=AUTHORITY,
)

result = app.acquire_token_for_client(scopes=SCOPES)
if "access_token" not in result:
    raise RuntimeError(f"Failed to get token: {result}")
access_token = result["access_token"]

# Use it:
headers = {"Authorization": f"Bearer {access_token}"}
```

---

# 2) User-delegated (desktop/dev) — **Interactive** or **Device Code**

Use this when you want the user to sign in and the API exposes a **delegated scope** like `user_impersonation`.

```python
# pip install msal
import msal, os, webbrowser

TENANT_ID = os.environ["TENANT_ID"]
CLIENT_ID = os.environ["PUBLIC_CLIENT_ID"]       # public client app reg (no secret)
API_SCOPE = os.environ.get("API_SCOPE", "api://<api-app-id>/user_impersonation")

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
app = msal.PublicClientApplication(client_id=CLIENT_ID, authority=AUTHORITY)

# Try cached token first
accounts = app.get_accounts()
result = None
if accounts:
    result = app.acquire_token_silent(scopes=[API_SCOPE], account=accounts[0])

# Fall back to interactive
if not result:
    flow = app.initiate_device_flow(scopes=[API_SCOPE])
    if "user_code" not in flow:
        raise RuntimeError("Failed to create device flow.")
    print(f"To sign in, go to {flow['verification_uri']} and enter code: {flow['user_code']}")
    result = app.acquire_token_by_device_flow(flow)  # blocks until completed

if "access_token" not in result:
    raise RuntimeError(f"Failed to get token: {result}")
access_token = result["access_token"]
```

> Tip: If you prefer a browser popup instead of device code:
>
> ```python
> result = app.acquire_token_interactive(scopes=[API_SCOPE], prompt="select_account")
> ```

---

# 3) **On-Behalf-Of (OBO)** — your backend receives a user token and trades it for your API

Use this when your server receives a user’s AAD token (e.g., from a SPA/API) and needs to call your proxy **on behalf of the user**.

```python
# pip install msal
import msal, os

TENANT_ID = os.environ["TENANT_ID"]
CLIENT_ID = os.environ["CLIENT_ID"]               # your confidential client (server)
CLIENT_SECRET = os.environ["CLIENT_SECRET"]
USER_JWT = "<incoming_user_access_token>"         # from Authorization header
API_SCOPE = "api://<api-app-id>/user_impersonation"

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"
app = msal.ConfidentialClientApplication(
    client_id=CLIENT_ID, client_credential=CLIENT_SECRET, authority=AUTHORITY
)

result = app.acquire_token_on_behalf_of(user_assertion=USER_JWT, scopes=[API_SCOPE])
if "access_token" not in result:
    raise RuntimeError(f"OBO failed: {result}")
access_token = result["access_token"]
```

---

# 4) **Managed Identity** (in Azure) or **DefaultAzureCredential** (app-to-app)

If your caller runs on Azure (VM, AKS, Functions, Web App) with a **Managed Identity** that has permission to your API, you can use `azure-identity`.

```python
# pip install azure-identity
from azure.identity import ManagedIdentityCredential, DefaultAzureCredential
import os

API_APP_ID_URI = os.environ["API_APP_ID_URI"]      # e.g., "api://<api-app-id>"
SCOPE = f"{API_APP_ID_URI}/.default"

# Prefer ManagedIdentityCredential in Azure; fall back to DefaultAzureCredential for dev
cred = ManagedIdentityCredential()  # or DefaultAzureCredential(exclude_interactive_browser_credential=True)
token = cred.get_token(SCOPE)       # returns AccessToken
access_token = token.token
```

> Note: Ensure your **Managed Identity** (or service principal behind DefaultAzureCredential) is granted access to the API (app role assignment or exposed scope consent). For custom APIs, the `/.default` pattern is the most reliable with confidential credentials.

---

## Plug the token into your **AzureOpenAI** client that calls the proxy

```python
from openai import AzureOpenAI

client = AzureOpenAI(
    api_key="placeholder",                 # ignored by proxy
    api_version="2024-06-01",
    azure_endpoint="https://<your-function>.azurewebsites.net"
)
client.default_headers = {"Authorization": f"Bearer {access_token}"}

resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Hello from a secured proxy!"}]
)
print(resp.choices[0].message.content)
```

Or with `requests`:

```python
import requests, json
headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}
url = "https://<your-function>.azurewebsites.net/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-06-01"
payload = {"messages":[{"role":"user","content":"Ping?"}]}
r = requests.post(url, headers=headers, data=json.dumps(payload), timeout=60)
r.raise_for_status()
print(r.json())
```

---

## Quick chooser

* **I have a client secret / service principal** → *Client credentials* (Option 1)
* **Developer at laptop wants to test as a user** → *Interactive/Device Code* (Option 2)
* **My API needs to call the proxy with user’s identity** → *On-Behalf-Of* (Option 3)
* **Running on Azure with Managed Identity** → *Managed Identity* (Option 4)


