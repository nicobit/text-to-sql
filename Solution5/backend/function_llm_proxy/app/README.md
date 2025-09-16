# Azure OpenAI LLM Proxy — FastAPI + Entra ID (AAD) + Azure Table


A minimal, production‑oriented proxy to Azure OpenAI that:
- Authenticates callers with Microsoft Entra ID (Azure AD)
- Tracks **per‑user daily token consumption** in **Azure Table Storage**
- Enforces a **daily quota** (caps output tokens to remaining budget)
- Exposes **usage** endpoints
- Supports **Responses**, **Completions (legacy)**, and **Embeddings**
- 🚫 **No chat** endpoint is implemented


## Quickstart
1. Create an App Registration in Entra ID. Add an API scope or use the application ID as audience.
2. Provision an Azure Storage Account (Tables). Create the `UsageDaily` table (the app will also auto‑create).
3. Create an Azure OpenAI resource + deployment. Note the endpoint and API version.
4. Copy `.env.sample` to `.env` and fill values.
5. Run locally:
```bash
uvicorn app.main:app --reload --port 8080
```
## Usage example

```python
from openai import AzureOpenAI

PROXY_BASE = "https://your-proxy.example.com"   # FastAPI base URL
API_VERSION = "2024-07-01-preview"
AAD_BEARER  = "<AAD access token issued for your PROXY app (audience = your App ID)>"

client = AzureOpenAI(
    azure_endpoint=PROXY_BASE,   # point to the proxy, not the Azure OpenAI resource
    api_version=API_VERSION,
    azure_ad_token=AAD_BEARER    # SDK sends Authorization: Bearer <token>
)

# Responses (non-chat)
resp = client.responses.create(
    model="<your-deployment-name>",
    input=[{"role": "user", "content": [{"type": "text", "text": "Write a haiku about lakes"}]}],
    max_output_tokens=200,
)
print(resp)

# Embeddings
emb = client.embeddings.create(
    model="<your-embeddings-deployment>",
    input=["hello world", "azure rocks"],
)
print(len(emb.data), len(emb.data[0].embedding))

```
