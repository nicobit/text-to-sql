# Multi-Host **FastAPI** Project — User Guide  
*(updated 2025-05-18)*  

---

## 1 Repository layout

```
text_to_sql/
│
├─ src/
│   ├─ app/                  # FastAPI application
│   └─ adapters/             # host glue
│
├─ infrastructure/           # deploy artefacts
│   ├─ Dockerfile
│   └─ kubernetes/
│
├─ tests/
├─ docs/                     # documentation
│
├─ pyproject.toml
├─ requirements.txt
└─ README.md
```

---

## 2 Local development

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install -e .                 # registers src/ packages
uvicorn app.api:app --reload
pytest
```

---

## 3 Container build

```bash
docker build -t text_to_sql:dev .
docker run -p 8000:8000 text_to_sql:dev
```

---

## 4 Hosting options

| Host | Deploy |
|------|--------|
| Azure Functions | `func azure functionapp publish … --python` |
| App Service (source) | `az webapp up --runtime PYTHON:3.10 …` |
| App Service / Container Apps / AKS (container) | build & push image, then `az webapp create` / `az containerapp create` / `kubectl apply -f infrastructure/kubernetes/` |

---

## 5 Kubernetes manifests

```yaml
# deployment.yaml (snippet)
containers:
  - name: api
    image: ghcr.io/your-org/text_to_sql:latest
    ports:
      - containerPort: 8000
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: text_to_sql
spec:
  type: LoadBalancer
  selector:
    app: text_to_sql
  ports:
    - port: 80
      targetPort: 8000
```

---

## 6 Secrets & config

```
export SETTINGS_BACKEND=envkv
export KEYVAULT_URL=https://kv-prod.vault.azure.net/
export OPENAI_KEY_SECRET=my-openai
```

---

## 7 Troubleshooting

| Issue | Fix |
|-------|-----|
| Import errors in container | Ensure `pip install -e .` and source copied in Dockerfile |
| MSI credential unavailable | Enable Managed Identity and grant Key Vault permissions |
| `KeyError` at startup | Missing env var / secret; see settings guide |

---

Happy shipping 🚀
