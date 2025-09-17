# Configuration & Deployment

## App Settings (Function App)

| Setting | Purpose |
|--------|---------|
| `TENANT_ID` | Primary tenant used by default |
| `AUDIENCE` | App ID URI or Client ID expected in JWT `aud` |
| `ALLOWED_TENANTS` | `*` or comma-separated tenant IDs |
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI endpoint (e.g., `https://<name>.openai.azure.com`) |
| `AZURE_OPENAI_API_VERSION` | e.g., `2024-06-01` |
| `AZURE_OPENAI_API_KEY` | AOAI API key (if not using KV) |
| `AZURE_OPENAI_KEY_VIA_KV` | `true/false` — pull API key from Key Vault |
| `KEY_VAULT_URI` | KV URI, e.g., `https://<kv>.vault.azure.net` |
| `KEY_VAULT_SECRET_NAME` | Secret name storing the AOAI key |
| `STORAGE_ACCOUNT_NAME` | Storage account for Table/Blob |
| `USAGE_TABLE_NAME` | Table name for usage (e.g., `UsageTokens`) |
| `AUDIT_BLOB_CONTAINER` | Optional container for JSONL logs |
| `ENABLE_BLOB_AUDIT` | `true/false` |
| `DEFAULT_DAILY_QUOTA` | e.g., `200000` tokens/day |
| `ENFORCE_QUOTA` | `true/false` to enable quota checks |
| `AzureWebJobsStorage` | Connection string (Functions runtime + used by Table client) |

> In production, prefer a **dedicated connection** for Table/Blob via `AZURE_STORAGE_CONNECTION_STRING`.  
> For local dev, `UseDevelopmentStorage=true` works with Azurite.

## Local Development

```bash
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp local.settings.json.example local.settings.json
func start
```

Open [http://localhost:7071/healthz](http://localhost:7071/healthz).

## Deploy

```bash
func azure functionapp publish <FUNCTION_APP_NAME> --python
```

Ensure all **App Settings** above are set in the Function App.
