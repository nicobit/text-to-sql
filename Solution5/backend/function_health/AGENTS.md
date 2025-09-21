# AGENTS.md

This repository is an **Azure Service Health API** implemented with **FastAPI** (and an **Azure Functions** ASGI wrapper). It exposes health checks for Azure dependencies and lets operators manage the health-check configuration at runtime.

Coding agents: use this file as your go-to guide for setup, conventions, tasks, and pitfalls.

---

## Setup Commands

- Create venv (Unix): `python -m venv .venv && source .venv/bin/activate`
- Create venv (Windows): `py -m venv .venv && .venv\Scripts\activate`
- Install deps: `pip install -r requirements.txt`
- Local dev (FastAPI): `uvicorn src.app:app --reload --port 8000`
- Optional: **Azure Functions local** (requires Azure Functions Core Tools): `func start`

> Python 3.12 recommended.

## Runbook: Local Development

1. Copy environment example: `cp .env.example .env` and edit values if needed.
2. Start the API: `uvicorn src.app:app --reload`
3. Open:
   - Liveness: `GET http://localhost:8000/healthz`
   - Readiness (checks): `GET http://localhost:8000/readyz`
   - Config CRUD: `GET http://localhost:8000/config` etc.

### As Azure Function (ASGI)

- Wrapper: `function_app/api/__init__.py` exposes `AsgiFunctionApp(app)`.
- Route mapping: `function_app/api/function.json` uses `"{*route}"` so any path (e.g., `/readyz`) is proxied.
- Local debug: ensure you have **host.json** and `local.settings.json` populated, then `func start`.

> For production, set app settings (env vars) in the Function App. Prefer **Managed Identity** over secrets.

---

## Project Structure

```
azure-service-health-api/
├─ src/
│  ├─ app.py                  # FastAPI app wiring (health + config routers)
│  ├─ settings.py             # pydantic BaseSettings (env vars)
│  ├─ models.py               # pydantic models (health + config payloads)
│  ├─ utils.py                # timed_call helper
│  ├─ config_loader.py        # resolves per-field config (inline | settings | Key Vault)
│  ├─ health_router.py        # /healthz, /readyz — runs checks concurrently
│  ├─ config_router.py        # /config/* CRUD for services config (uses repository)
│  ├─ repositories/
│  │  ├─ base.py              # ConfigRepository interface
│  │  ├─ blob_repo.py         # Azure Blob Storage implementation
│  │  └─ file_repo.py         # Local file implementation
│  └─ checks/
│     ├─ key_vault.py
│     ├─ ai_search.py
│     ├─ azure_openai.py
│     ├─ sql_db.py
│     ├─ storage_blob.py
│     ├─ storage_table.py
│     └─ service_bus.py
├─ function_app/
│  └─ api/
│     ├─ __init__.py          # AsgiFunctionApp wrapper
│     └─ function.json
├─ host.json
├─ local.settings.json        # sample Function settings
├─ requirements.txt
├─ .env.example
└─ README.md
```

---

## Configuration Model (what the API reads)

The API loads a JSON configuration that defines which services to check and where each configuration **value** comes from.

- **Repository pattern** (preferred): configure where the JSON lives via env vars.
  - `CONFIG_REPOSITORY_KIND=blob|file`
  - **Blob repo**: `CONFIG_BLOB_ACCOUNT_URL`, `CONFIG_BLOB_CONTAINER`, `CONFIG_BLOB_NAME`, optional `CONFIG_BLOB_CONNECTION_STRING`
  - **File repo**: `CONFIG_FILE_PATH`
- Fallbacks (if no repo): `SERVICES_CONFIG_PATH` or `SERVICES_CONFIG_JSON`.

### JSON Schema (simplified)

```jsonc
{
  "default_timeout_seconds": 3.5,
  "services": [
    {
      "name": "search",
      "type": "ai_search",                    // one of: sql_db, key_vault, storage_blob, storage_table, azure_openai, ai_search, service_bus
      "enabled": true,
      "config": {
        // Each field below is resolved via one of these sources:
        //   { "source": "inline",   "value": "<literal>" }
        //   { "source": "settings", "setting_name": "ENV_VAR_NAME" }
        //   { "source": "kv",       "key_vault": { "vault_uri": "https://...", "secret_name": "..." } }
        "endpoint":   { "source": "settings", "setting_name": "AI_SEARCH_ENDPOINT" },
        "index_name": { "source": "settings", "setting_name": "AI_SEARCH_INDEX" }
      }
    }
  ]
}
```

### Supported service `type` values and expected `config` keys

- `sql_db`: `conn_str`
- `key_vault`: `vault_uri`, optional `test_secret_name`
- `storage_blob`: `connection_string` *or* (`endpoint` + MI), optional `container`
- `storage_table`: `connection_string` *or* (`endpoint` + MI), optional `table_name`
- `azure_openai`: `endpoint`, optional `api_version`, `live_call`, `deployment`
- `ai_search`: `endpoint`, `index_name`
- `service_bus`: `namespace`, `entity` object:
  - queue: `{ "type":"queue", "queue_name":"..." }`
  - subscription: `{ "type":"subscription", "topic_name":"...", "subscription_name":"..." }`

> **Value resolution** is handled by `src/config_loader.py`

---

## Endpoints (FastAPI inside Azure Function)

- `GET /healthz` — liveness
- `GET /readyz` (alias `/deps`) — runs all enabled checks from the **current** config
- `GET /config` → `{ etag, config }`
- `PUT /config` → replace entire config (send `If-Match` with previous `etag` to avoid races)
- `GET /config/services`
- `GET /config/services/{name}`
- `POST /config/services`
- `PUT /config/services/{name}`
- `DELETE /config/services/{name}`

**Concurrency:** The repository returns an `etag`. Send `If-Match: <etag>` on writes. On mismatch, API returns **409**.

**Security:** In production, protect `/config/*` (e.g., Azure Functions **function** auth, APIM + AAD, or JWT middleware). Current sample uses anonymous for simplicity.

---

## How Checks Work (cheap + safe)

- Key Vault: `get_secret(name)` if provided, else list first secret properties.
- AI Search: `get_document_count()`.
- Azure OpenAI: list deployments (no token usage) — or tiny 1‑token chat call if `live_call=true`.
- SQL: `SELECT 1` via ODBC.
- Storage Blob: `get_container_properties()` if container set; else service properties/list first container.
- Storage Table: `list_entities(top=1)` if table set; else list first table.
- Service Bus: `peek_messages(1)` on queue or subscription (no settlement).

**Auth:** Uses `DefaultAzureCredential`. In Azure, assign **Managed Identity** with least-privilege data‑plane roles.

---

## Agent Tasks & Conventions

### Common Tasks

- **Add a new service type**  
  1. Create `src/checks/<new_type>.py` exporting `async def check_<new_type>(...) -> Dict`  
  2. Wire it in `src/health_router.py`’s `_build_tasks_from_json()` with the expected `config` fields.  
  3. Add any new dependencies to `requirements.txt`.  
  4. Update `README.md`, `AGENTS.md`, and `local.settings.json` example.  
  5. Keep the check **idempotent**, **fast**, and avoid stateful writes.

- **Add a new repository backend**  
  1. Implement `ConfigRepository` in `src/repositories/<kind>_repo.py`.  
  2. Register it in `src/repositories/factory.py`.  
  3. Document new env vars and sample configuration.

- **Change config shape**  
  - Update `src/models.py` (if pydantic models change) and `config_loader.py`.  
  - Ensure backward compatibility or provide a migration note.

### Coding Style

- Python 3.12, type hints encouraged.
- Prefer async SDKs or run blocking calls via `anyio.to_thread.run_sync`.
- Keep checks short and network‑bounded with a clear timeout (see `utils.timed_call`).

### Testing (if you add tests)

- Use `pytest` (add to `requirements.txt` or a `requirements-dev.txt`).  
- Mock Azure SDK calls for unit tests.  
- For live tests, require explicit env flags to avoid unintentional resource usage.

---

## Security & Secrets

- **Do not** hardcode credentials. Use env vars or Key Vault via the JSON `kv` source.
- **Do not** log secrets or tokens. Sanitize exception messages before returning details.
- Prefer **Managed Identity** with least-privilege roles (e.g., Blob/Table Data Reader, Key Vault get, Search query, AOAI User, Service Bus Data Receiver).

---

## Pitfalls to Avoid (for agents)

- Don’t change HTTP shapes of existing endpoints without updating `README.md` & `AGENTS.md`.
- Don’t turn health checks into **write** operations (keep them read-only and safe).
- Don’t add long-running or multi-minute checks; keep checks **quick** and cancellable.
- Don’t bypass ETag concurrency on config writes—always honor `If-Match`.
- Don’t store secrets in the repository JSON; store references (settings/kv) instead.

---

## Quick Reference

- **Entrypoint**: `src/app.py` (FastAPI app)  
- **Routers**: `src/health_router.py`, `src/config_router.py`  
- **Config resolution**: `src/config_loader.py`  
- **Repos**: `src/repositories/*`  
- **Checks**: `src/checks/*`  
- **Function wrapper**: `function_app/api/__init__.py`

---

## Attribution

AGENTS.md is a simple, open format for guiding coding agents—think “README for agents.” See examples and guidance at agents.md. 
