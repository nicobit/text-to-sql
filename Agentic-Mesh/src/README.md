# Agentic Mesh (Azure Edition with MCP)

## Prereqs
- Azure CLI, kubectl, containerapp CLI, Docker, ACR

## Setup AKS Agents
1. `az aks get-credentials`
2. `kubectl apply -f k8s-manifests/`

## Setup Container Apps Agents
1. `az containerapp env create --name mesh-env ...`
2. `az containerapp create --source aca-manifests/translate-app.yaml`
3. same for sql-app

## Deploy Orchestrator
1. `cd azure-function`
2. `func start` or `func azure functionapp publish <AppName>`

## Usage
- POST to `/api/orchestrator` with JSON `{"text":"..."}`, header `X-Session-ID`
- Orchestrator will load session, RAG context, plan via GPT-4, invoke agents over MCP, and return `{ answer, trace }`