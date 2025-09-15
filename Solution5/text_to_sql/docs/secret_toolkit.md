# Secrets Toolkit for Python Apps  
*A provider-agnostic way to load configuration & secrets*



## 1 What problem does this code solve?

* Keep application code **indifferent** to where a secret is stored (env-var, one/many Azure Key Vaults, etc.).  
* Allow **layered fall-back** – e.g. *“Check an env var first; if it’s absent, try Key Vault.”*  
* Offer **typed settings objects** (dataclass) so the rest of your code uses `settings.openai.api_key`, never raw strings.  
* Make it **trivial to plug in another backend** – just write one small class and register it.



## 2 Core pieces

| File | Role |
|------|------|
| `config/provider_base.py` | Abstract contract (`get`, `set`). |
| `config/env_provider.py` | Reads/writes plain environment variables. |
| `config/keyvault_provider.py` | Single Azure Key Vault. |
| `config/multi_kv_provider.py` | Several Key Vaults with optional *default* vault. |
| `config/env_kv_provider.py` | Env-var **points to** a secret *name* in Key Vault. |
| `config/chain_provider.py` | **New** – tries a list of providers in order, no caching. |
| `config/factory.py` | Builds the chain from environment variables. |
| `config/settings.py` | Typed dataclasses + `_get()` helper (with per-field defaults). |

> **No caching inside `ChainProvider`** – each concrete provider may cache its own hits.



## 3 Provider order and flags

```text
         +-----------------+
         | EnvProvider (*) |   ← optional override layer
         +-----------------+
                │
                ▼
  +---------------------------------+
  |  KeyVaultProvider   OR          |
  |  MultiKeyVaultProvider OR       |   chosen via SETTINGS_BACKEND
  |  EnvRefKeyVaultProvider         |
  +---------------------------------+


| Variable                | Default | Purpose                                                    |
| ----------------------- | ------- | ---------------------------------------------------------- |
| `SETTINGS_BACKEND`      | `env`   | `env` · `keyvault` · `multikv` · `envkv`                   |
| `ALLOW_ENV`             | `1`     | `0` disables EnvProvider layer.                            |
| *backend-specific vars* |         | `KEYVAULT_URL`, `KV_URLS`, `KV_DEFAULT`, `KV_ENV_SUFFIX` … |

```

### 3.1  Typical configurations

| Goal                                    | Environment variables to set                                                     |
| --------------------------------------- | -------------------------------------------------------------------------------- |
| **Local dev** – env vars only           | *(nothing)*                                                                      |
| **Prod with KV, env overrides allowed** | `SETTINGS_BACKEND=keyvault`  `KEYVAULT_URL=https://kv.vault.azure.net/`          |
| **Prod, no env overrides**              | `SETTINGS_BACKEND=keyvault`  `ALLOW_ENV=0`                                       |
| **Multi-vault + env overrides**         | `SETTINGS_BACKEND=multikv`  `KV_URLS='{"core":"…","ai":"…"}'`  `KV_DEFAULT=core` |
| **Env-var → KV indirection**            | `SETTINGS_BACKEND=envkv`  `KEYVAULT_URL=…`  `OPENAI_KEY_SECRET=my-openai`        |

---

## 4  Using the settings in application code

```python
from config.settings import load_settings

cfg = load_settings()                 # singleton
openai.api_key  = cfg.openai.api_key  # always defined or the app fails fast
openai.api_base = cfg.openai.endpoint
```

No knowledge of Key Vault, env-vars, or provider order leaks into the service layer.



## 5  Per-setting defaults & casting

```python
# config/settings.py  (snippet)
from dataclasses import dataclass

def _get(key, *, default=None, cast=None):
    ...

@dataclass(frozen=True, slots=True)
class OpenAISettings:
    endpoint: str = _get("OPENAI_ENDPOINT",
                         default="https://api.openai.com/v1")
    api_key:  str = _get("OPENAI_KEY")          # mandatory – no default
```


## 6  Writing your own provider

1. **Subclass** `SettingsProvider`.

   ```python
   from config.provider_base import SettingsProvider
   class SSMProvider(SettingsProvider):
       def __init__(self, region): ...
       def get(self, key): ...
       def set(self, key, value): ...
   ```
2. **Register** it in `config/factory.py`

   ```python
   elif backend == "ssm":
       chain.append(SSMProvider(region=os.getenv("AWS_REGION","eu-west-1")))
   ```
3. **Document** the new `SETTINGS_BACKEND` value and any env vars.
4. **(Optional)** add internal caching if the remote store is slow.



## 7  Running in Azure hosts

### 7.1  Azure Functions

```bash
func azure functionapp publish my-func \
  --identity                    # enable managed identity
az keyvault set-policy --name kv-prod \
  --object-id <principalId> --secret-permissions get list
az functionapp config appsettings set \
  -g rg -n my-func \
  --settings SETTINGS_BACKEND=keyvault KEYVAULT_URL=https://kv-prod.vault.azure.net/
```

> Functions runtime exposes **App Settings** as environment variables, so the toolkit works unchanged.



### 7.2  App Service / Container Apps

```bash
az webapp identity assign -g rg -n my-app      # managed identity
az keyvault set-policy --name kv-prod \
     --object-id <principalId> --secret-permissions get list
az webapp config appsettings set -g rg -n my-app \
     --settings SETTINGS_BACKEND=keyvault KEYVAULT_URL=https://kv-prod.vault.azure.net/
```

Container Apps: use the **“Secrets & configuration”** blade or `az containerapp secret set`.



### 7.3  AKS or generic Kubernetes

1. **Workload identity / Pod MSI**

   ```yaml
   # deployment.yml
   env:
     - name: SETTINGS_BACKEND
       value: keyvault
     - name: KEYVAULT_URL
       value: https://kv-prod.vault.azure.net/
   annotations:
     azure.workload.identity/client-id: <appId>
   ```

2. Grant the **federated identity** `get` / `list` on the vault.

3. (Optional) mount plain env-vars or ConfigMap for overrides.



## 8  Testing

```python
from config.chain_provider import ChainProvider
from config.env_provider   import EnvProvider
from tests.fake_provider   import FakeProvider   # your in-mem mock

chain = ChainProvider(FakeProvider({"OPENAI_KEY": "test"}), EnvProvider())
assert chain.get("OPENAI_KEY") == "test"
```

Integration tests can spin up **Azurite Key Vault emulator** or patch `DefaultAzureCredential` with `AzureCliCredential()`.



## 9  Troubleshooting checklist

1. **KeyError** → key not present in *any* provider.
2. `ManagedIdentityCredential: unavailable` → MSI not enabled / wrong region.
3. Secret rotation not visible → remember internal caches (`@lru_cache`) in providers; restart pod or remove cache decorators.
4. Performance hit → add TTL cache inside slow provider or enable **negative-result cache** in a custom chain wrapper.



Happy secure coding!


