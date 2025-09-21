# Azure Service Health API — Repo-backed config + CRUD

Now the services configuration is stored via a **repository pattern** (initially **Azure Blob Storage**), and you have **CRUD** endpoints to manage it at runtime. The health checks read the **latest** config from the repository.

## Choose a repository
Set env vars:
- `CONFIG_REPOSITORY_KIND=blob` (or `file`)
- Blob settings: `CONFIG_BLOB_ACCOUNT_URL`, `CONFIG_BLOB_CONTAINER`, `CONFIG_BLOB_NAME` (optional `CONFIG_BLOB_CONNECTION_STRING`)
- File settings: `CONFIG_FILE_PATH`

> With `blob`, the Function App's managed identity must have **Blob Data Contributor** (read/write) on the container.

## Endpoints
- `GET /healthz` — liveness
- `GET /readyz` — run checks using the current repo config
- **Config management (under `/config`)**
  - `GET /config` → returns `{ etag, config }`
  - `PUT /config` → replace whole config (use `If-Match` header with the returned `etag` for safe concurrency)
  - `GET /config/services` → list
  - `GET /config/services/{name}` → get one
  - `POST /config/services` → add
  - `PUT /config/services/{name}` → update
  - `DELETE /config/services/{name}` → delete

### Minimal config JSON
```json
{
  "default_timeout_seconds": 3.5,
  "services": [
    { "name": "sql", "type": "sql_db", "enabled": true, "config": { "conn_str": { "source": "kv", "key_vault": { "vault_uri": "https://<vault>.vault.azure.net/", "secret_name": "sql-odbc-connstr" } } } },
    { "name": "blob", "type": "storage_blob", "enabled": true, "config": { "endpoint": { "source": "settings", "setting_name": "BLOB_ENDPOINT" }, "container": { "source": "inline", "value": "sample-container" } } },
    { "name": "table", "type": "storage_table", "enabled": true, "config": { "connection_string": { "source": "kv", "key_vault": { "vault_uri": "https://<vault>.vault.azure.net/", "secret_name": "storage-connstr" } }, "table_name": { "source": "inline", "value": "sampletable" } } },
    { "name": "search", "type": "ai_search", "enabled": true, "config": { "endpoint": { "source": "settings", "setting_name": "AI_SEARCH_ENDPOINT" }, "index_name": { "source": "settings", "setting_name": "AI_SEARCH_INDEX" } } },
    { "name": "aoai", "type": "azure_openai", "enabled": true, "config": { "endpoint": { "source": "settings", "setting_name": "AZURE_OPENAI_ENDPOINT" }, "api_version": { "source": "inline", "value": "2024-10-21" }, "live_call": { "source": "inline", "value": false }, "deployment": { "source": "settings", "setting_name": "AZURE_OPENAI_DEPLOYMENT" } } },
    { "name": "kv", "type": "key_vault", "enabled": true, "config": { "vault_uri": { "source": "settings", "setting_name": "KEY_VAULT_URI" }, "test_secret_name": { "source": "settings", "setting_name": "KEY_VAULT_TEST_SECRET_NAME" } } },
    { "name": "sbq", "type": "service_bus", "enabled": true, "config": { "namespace": { "source": "settings", "setting_name": "SERVICEBUS_NAMESPACE" }, "entity": { "type": { "source": "inline", "value": "queue" }, "queue_name": { "source": "inline", "value": "my-queue" } } } }
  ]
}
```

## Securing management endpoints
- This sample exposes everything with `authLevel=anonymous` for simplicity.
- In production, **restrict** `/config/*` endpoints via:
  - Azure Functions authLevel=Function (and use function keys), or
  - Fronting with APIM/App Gateway + AAD, or
  - Add JWT validation middleware in FastAPI.

## Concurrency
- `GET /config` returns an `etag`. Send it back as `If-Match` header on `PUT /config`, `POST/PUT/DELETE /config/services*` to avoid overwriting concurrent changes.

## How /readyz uses updates
`/readyz` pulls the latest config from the repository on every call, so edits via `/config/*` are immediately reflected.
