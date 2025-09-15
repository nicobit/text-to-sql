# Settings User Guide
*Last updated: 2025-05-18*

This document explains **what each setting means, where it comes from, the
default value (if any) and how to override it** when you run the application.
It corresponds to the `load_settings()` schema in `config/settings.py`.

---

## 1  How settings are loaded

```python
from config.settings import load_settings
settings = load_settings()     # returns an AppSettings instance (singleton)
```

`load_settings()` builds one *provider chain* and then calls the helper
function `_get(key, …)` for every field:

| Step | Action |
|------|--------|
| 1 | `_provider.get(key)` checks Env → Key Vault → … in order. |
| 2 | If the key is missing and **no `default=`** is supplied, a `KeyError`
      is raised → the app fails fast. |
| 3 | If a `default=` is supplied, that value is used instead. |
| 4 | If `cast=` is supplied, the raw string is converted (e.g. to `int`
      or `bool`). |

---

## 2  Settings reference

### 2.1  `AzureSettings`

| Env var | Required | Default | Description |
|---------|----------|---------|-------------|
| `AZURE_TENANT_ID` | **yes** | – | AAD tenant the app authenticates against. |
| `AZURE_CLIENT_ID` | **yes** | – | Client‑ID of the service principal / MSI. |
| `AZURE_CLIENT_SECRET` | **yes** | – | Client secret or cert thumb‑print. |

### 2.2  `DatabaseSettings`

| Env var | Required | Default | Notes |
|---------|----------|---------|-------|
| `ODBC_DRIVER` | no | `ODBC Driver 17 for SQL Server` | Name passed to pyODBC. |
| `DATABASE_DNS` | no | *empty* | **Secret name** that holds the server DNS. |
| `PASSWORD` | no | *empty* | **Secret name** for DB password. |
| `USERNAME` | no | *empty* | **Secret name** for DB user. |
| `DATABASE_NAME` | no | *empty* | Target database inside the server. |
| `ROWS_LIMIT` | no | `1000` | Parsed as `int`; max rows per query. |

### 2.3  `StorageSettings`

| Env var | Required | Default | Description |
|---------|----------|---------|-------------|
| `BLOB_STORAGE_CONNECTION_STRING` | **yes** | – | **Secret name** of the Azure Storage connection string. |

### 2.4  `OpenAISettings`

| Env var | Required | Default |
|---------|----------|---------|
| `OPENAI_ENDPOINT` | no | `https://api.openai.com/v1` |
| `OPENAI_KEY` | **yes** | – |
| `OPENAI_VERSION` | **yes** | – |
| `EMBEDDING_MODEL` | no | `text-embedding-ada-002` |
| `COMPLETION_MODEL` | no | `gpt-35-turbo` |

### 2.5  `SearchAISettings`

| Env var | Required | Default |
|---------|----------|---------|
| `SEARCH_ENDPOINT` | no | `https://api.search.ai/v1` |
| `SEARCH_API_KEY` | **yes** | – |
| `SEARCH_VERSION` | **yes** | – |
| `SEARCH_MODEL` | no | `text-search-ada-001` |

### 2.6  `ApplicationInsightSettings`

| Env var | Required | Default |
|---------|----------|---------|
| `APPLICATION_INSIGHT_CONNECTION_STRING` | no | *empty* |

### 2.7  `FeatureFlags`

| Env var | Required | Default | Cast |
|---------|----------|---------|------|
| `USE_CHEAP_EMBEDDINGS` | no | `false` | `"1" / "true" / "yes"` → `True` |

---

## 3  Quick examples

### 3.1  Local development (env vars only)

```bash
export AZURE_TENANT_ID=...            # etc.
export ODBC_DRIVER='ODBC Driver 17 for SQL Server'
export OPENAI_KEY=sk-local-test
python main.py
```

### 3.2  Production with Azure Key Vault

```bash
export SETTINGS_BACKEND=keyvault
export KEYVAULT_URL=https://kv-prod.vault.azure.net/
export ALLOW_ENV=0                    # disallow runtime overrides

# Only *secret names* go into env vars
export DATABASE_DNS=my-db-dns
export PASSWORD=my-db-password
...
```

The toolkit pulls the actual values from Key Vault at runtime.

---

## 4  Extending the schema

Add a field:

```python
@dataclass(frozen=True, slots=True)
class FeatureFlags:
    ...
    enable_beta: bool = _get(
        "ENABLE_BETA",
        default="false",
        cast=lambda s: str(s).lower() in ('1', 'true', 'yes')
    )
```

No other code needs to change—`settings.flags.enable_beta` becomes available.

---

## 5  FAQ

**Q : I got `KeyError("OPENAI_KEY")`.**  
A : Provide `OPENAI_KEY` via env var or put a secret of that name in Key Vault.

**Q : How do I point to a different Key Vault per environment?**  
A : Set `KEYVAULT_URL` accordingly or use the `multikv` backend.

**Q : How do I rotate secrets without a deploy?**  
A : Rotate in Key Vault. Restart the pod or remove provider-level caches for
immediate effect.

---

Happy coding!
