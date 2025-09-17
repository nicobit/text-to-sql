# Azure Functions OpenAI Proxy — Documentation

This documentation covers the **Azure Functions (Python + FastAPI) OpenAI proxy** , secured by **Microsoft Entra ID (AAD)** and equipped with **token usage logging and daily quota enforcement** using **Azure Table Storage** — with examples from **basic usage** to **LangGraph** orchestration.

> This is the doc set for the function-based proxy you can drop in front of Azure OpenAI and then point SDKs at it as if it were an LLM endpoint.

## Contents

- [Architecture Overview](architecture/overview.md)
- [Configuration & Deployment](setup/CONFIGURATION.md)
- [API Reference](appendix/API_REFERENCE.md)
- Usage Guides
  - [Quickstart (cURL, Python SDK)](usage/QUICKSTART.md)
  - [LangGraph Examples](usage/LANGGRAPH_EXAMPLES.md)
- Operations
  - [Observability & Usage Accounting](operations/OBSERVABILITY.md)
  - [Security Notes](security/SECURITY.md)

## Project Context

This proxy:
- **Validates AAD Bearer tokens** (audience, issuer, signature via JWKS).
- **Proxies** `chat/completions` and `embeddings` to Azure OpenAI.
- **Logs** `prompt_tokens`, `completion_tokens`, `total_tokens` per **user/day** to **Azure Table Storage**.
- **Enforces daily quotas** per user (configurable, with admin endpoint to adjust per-user quota).
- Supports **streaming** and **non-streaming** responses (tallying usage accordingly).
- Optional **Key Vault** for the AOAI API key.
