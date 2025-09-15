# ------------------------------------------------------------------
# FastAPI MCP Proxy – container image
# ------------------------------------------------------------------
FROM python:3.11-slim

# ---- system deps --------------------------------------------------
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential curl && \
    rm -rf /var/lib/apt/lists/*

# ---- app code -----------------------------------------------------
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

# ---- runtime ------------------------------------------------------
ENV PYTHONUNBUFFERED=1 \
    UVICORN_HOST=0.0.0.0 \
    UVICORN_PORT=8081 \
    MCP_SERVER_URL=http://azure_mcp_server:3000/sse  

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8081"]
