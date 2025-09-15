# core_api.Dockerfile
FROM python:3.10-slim

COPY requirements.txt pyproject.toml src/ adapters/ ./
RUN pip install -r requirements.txt && pip install -e .[prod]

CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "-b", "0.0.0.0:8000", "adapters.gunicorn.wsgi_core:app"]
