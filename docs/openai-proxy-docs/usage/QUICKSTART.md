# Quickstart

## 1) Acquire a Bearer token

Use any AAD flow targeted at your **proxy API** (the `AUDIENCE` you set). For local testing, you can extract a token from `az account get-access-token` if you exposed your API in the same tenant, or use OAuth Device Code with MSAL.

## 2) cURL

```bash
export AAD_TOKEN="<your access token>"
curl -s -X POST "https://<your-function>.azurewebsites.net/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-06-01" \
  -H "Authorization: Bearer $AAD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Ping from proxy?"}]}'
```

## 3) Python SDK (AzureOpenAI)

```python
from openai import AzureOpenAI

aad_token = "<access token for your AUDIENCE>"

client = AzureOpenAI(
    api_key="placeholder",        # ignored by the proxy
    api_version="2024-06-01",
    azure_endpoint="https://<your-function>.azurewebsites.net"
)

client.default_headers = {"Authorization": f"Bearer {aad_token}"}

resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role":"user","content":"Hello, proxy!"}]
)
print(resp.choices[0].message.content)
```

## 4) Streaming

```bash
curl -N -X POST "https://<your-function>.azurewebsites.net/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-06-01" \
  -H "Authorization: Bearer $AAD_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stream":true,"messages":[{"role":"user","content":"Stream test"}]}'
```

The proxy passes through SSE events; token usage is tallied on the final event (with a fallback estimate for prompts).
