# API Reference

All routes live at the **Function root** (route prefix disabled).

## Health

```
GET /healthz
200 {"status":"ok","time":"..."}
```

## Usage

```
GET /usage/today          # requires Bearer AAD
GET /usage/range?from=YYYY-MM-DD&to=YYYY-MM-DD
PUT /quota/{userId}?quota=123456   # demo only; protect in prod
```

**Response sample (`/usage/today`)**
```json
{
  "PartitionKey": "user@example.com",
  "RowKey": "20250917",
  "prompt_tokens": 123,
  "completion_tokens": 456,
  "total_tokens": 579,
  "quota": 200000,
  "model": "gpt-4o-mini"
}
```

## OpenAI-Compatible

### Chat Completions (Azure-style)

```
POST /openai/deployments/{deployment}/chat/completions?api-version=2024-06-01
Headers: Authorization: Bearer <AAD token>
Body:   OpenAI chat payload
```

### Embeddings (Azure-style)

```
POST /openai/deployments/{deployment}/embeddings?api-version=2024-06-01
Headers: Authorization: Bearer <AAD token>
Body:   OpenAI embeddings payload
```

### OpenAI-style convenience

```
POST /v1/chat/completions
```

Uses a default deployment configured in code.
