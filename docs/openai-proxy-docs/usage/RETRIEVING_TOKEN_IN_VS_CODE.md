
# 1) Use your VS Code sign-in (VisualStudioCodeCredential)

Sign in in VS Code (Command Palette → “**Azure: Sign In**”), select the **correct tenant**.

```python
# pip install azure-identity
from azure.identity import VisualStudioCodeCredential
import os

API_APP_ID_URI = os.getenv("API_APP_ID_URI", "api://<your-proxy-app-id>")  # audience of your proxy
SCOPE = f"{API_APP_ID_URI}/.default"

cred = VisualStudioCodeCredential(
    # if you work across multiple tenants, either pin tenant_id...
    tenant_id="<your-tenant-guid>",
    # ...or allow multi-tenant (dev only)
    additionally_allowed_tenants=["*"]
)

token = cred.get_token(SCOPE).token
print("Bearer:", token[:32], "…")  # use this in Authorization: Bearer <token>
```

# 2) Use your Azure CLI login (very reliable locally)

In VS Code Terminal:

```bash
az login --tenant <your-tenant-guid>
az account set --subscription "<name-or-id>"
# Quick check (v2 endpoint, recommended):
az account get-access-token --scope api://<your-proxy-app-id>/.default -o tsv --query accessToken
```

From Python:

```python
from azure.identity import AzureCliCredential

SCOPE = "api://<your-proxy-app-id>/.default"
cred = AzureCliCredential(tenant_id="<your-tenant-guid>")
access_token = cred.get_token(SCOPE).token
```

# 3) Drop it into your AzureOpenAI client (calling the proxy)

```python
from openai import AzureOpenAI

access_token = token  # from either method above

client = AzureOpenAI(
    api_key="placeholder",                    # ignored by the proxy
    api_version="2024-06-01",
    azure_endpoint="https://<your-function>.azurewebsites.net"
)
client.default_headers = {"Authorization": f"Bearer {access_token}"}

resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role":"user","content":"Hello from VS Code!"}]
)
print(resp.choices[0].message.content)
```

# Quick fixes for common VS Code issues

* **“Tenant not allowed”** → pass `tenant_id="<tenant-guid>"` or `additionally_allowed_tenants=["*"]` to the credential; ensure the account you signed in with belongs to that tenant.
* **“Refresh token expired”** → re-auth:

  * VS Code: Command Palette → **Azure: Sign Out** → **Azure: Sign In** (choose the right tenant).
  * CLI: `az account clear && az login --tenant <tenant-guid>`.
* **403 from your proxy** → the token’s `aud` must equal your proxy’s **AUDIENCE** (e.g., `api://<proxy-app-id>`). Request the right **scope**: `api://<proxy-app-id>/.default` (or a specific delegated scope if you created one, e.g., `.../user_impersonation`).

Here are two super-short, single-tenant options you can drop into your **VS Code** sample. Pick one.

---

## Option A — Azure CLI (fewest moving parts)

> Sign in once in the VS Code terminal: `az login --tenant <TENANT_ID>`

```python
# pip install azure-identity openai
from azure.identity import AzureCliCredential
from openai import AzureOpenAI

TOKEN = AzureCliCredential(tenant_id="<TENANT_ID>").get_token("api://<PROXY_APP_ID>/.default").token

client = AzureOpenAI(
    api_key="x",  # ignored by your proxy
    api_version="2024-06-01",
    azure_endpoint="https://<your-function>.azurewebsites.net"
)
client.default_headers = {"Authorization": f"Bearer {TOKEN}"}

resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role":"user","content":"Hello from VS Code!"}]
)
print(resp.choices[0].message.content)
```

---

## Option B — VS Code account (uses your Azure sign-in in the IDE)

> Make sure you’re signed in: Command Palette → **Azure: Sign In** (same tenant).

```python
# pip install azure-identity openai
from azure.identity import VisualStudioCodeCredential
from openai import AzureOpenAI

TOKEN = VisualStudioCodeCredential(tenant_id="<TENANT_ID>").get_token("api://<PROXY_APP_ID>/.default").token

client = AzureOpenAI(api_key="x", api_version="2024-06-01", azure_endpoint="https://<your-function>.azurewebsites.net")
client.default_headers = {"Authorization": f"Bearer {TOKEN}"}

resp = client.chat.completions.create(model="gpt-4o-mini",
    messages=[{"role":"user","content":"Hello via VS Code credential!"}]
)
print(resp.choices[0].message.content)
```
