To install the requirements.txt for your orchestrator (or any Python component), you typically do it in one of two environments:

✅ Option 1: Install Locally (for development)

From your terminal:


```bash
cd orchestrator/
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```


This creates a Python virtual environment and installs all dependencies listed in requirements.txt.

✅ Option 2: Install Inside Docker (for containerized deployment)

Your Dockerfile already has the correct lines:

Dockerfile
```bash
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```
Then build the container with:

```bash
docker build -t orchestrator ./orchestrator
```

Or with Docker Compose:

```bash
docker compose up --build orchestrator
```

📦 Tip: Add Missing Dev Tools (optional)

If you're running locally, you might want to also install:

```bash
pip install uvicorn[standard] python-dotenv

```

And run it with:

```bash
uvicorn orchestrator.main:app --reload --port 8000

```


### Reload .env values

```bash
docker compose up -d --force-recreate
```


### TEST

curl -X POST http://localhost:8000/chat -H "Content-Type: application/json" -d '{"user_id":"user 1","message":"How many storage accounts there are ?"}'
