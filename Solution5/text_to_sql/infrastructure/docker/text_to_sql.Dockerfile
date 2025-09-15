# ───────────────────────────────
# Stage 1 – build / pip install
# ───────────────────────────────
FROM python:3.10-slim AS build
WORKDIR /build

# 1. install third-party deps first (better layer-caching)
COPY requirements.txt .
RUN pip install --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# 2. copy project metadata *and* source
COPY pyproject.toml ./
COPY src/ ./src
COPY adapters/ ./adapters/      
COPY docs/ ./docs/              

# 3. install **our own package** so `import app.api` works
#    -e . == "editable", but inside a container it becomes a normal site-package
RUN pip install --no-cache-dir -e .

# ───────────────────────────────
# Stage 2 – runtime image (smaller)
# ───────────────────────────────
FROM python:3.10-slim AS runtime
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install security updates to reduce vulnerabilities
RUN apt-get update && apt-get upgrade -y && apt-get clean && rm -rf /var/lib/apt/lists/*

# copy the installed site-packages and the source files
COPY --from=build /usr/local/lib/python3.10/site-packages \
                  /usr/local/lib/python3.10/site-packages
COPY --from=build /build/src /app/src
COPY --from=build /build/adapters /app/adapters

# Gunicorn with a single Uvicorn worker class
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:8000", "adapters.gunicorn.wsgi:app"]
