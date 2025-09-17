# Security Notes

- **Bearer JWT** required for all API routes (except `/healthz`).
- **Audience (`AUDIENCE`)**: must match the **App ID URI** or **Client ID** used when requesting tokens.
- **Tenants**: restrict via `ALLOWED_TENANTS`. Set to `*` only for multi-tenant lab/dev.
- **Token identity**: We derive `user_id` from `oid`, `sub`, or `preferred_username`/`upn`/`email`.
- **Admin endpoints**: Protect `PUT /quota/{userId}` with proper **app roles** or **group claims** in production.
- **Secrets**: Prefer **Key Vault** for AOAI key. Avoid storing secrets in `local.settings.json` or repo.
- **CORS**: If needed, enable CORS on the Function App level or add FastAPI middleware.
