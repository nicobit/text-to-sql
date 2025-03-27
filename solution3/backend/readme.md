# Deployment

py -3.10 -m venv myenv

Before you publish, run the following command to install the dependencies locally:

 pip install  --target=".python_packages/lib/site-packages"  -r requirements.txt

How to install poetry

(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -

initialize poetry:
poetry init

To deploy by commnand line :

az functionapp deployment source config-zip --resource-group 'ai-poc-rg' --name 'nicbit-ai-func' --src 'function_app.zip' --build-remote true

To Test:
Invoke-RestMethod -Uri "https://nicbit-ai-func.azurewebsites.net/query" -Method Post -Body (@{ query  = "value"; session_id = "test" } | ConvertTo-Json -Depth 10 ) -ContentType "application/json"



fastapi
azurefunctions-extensions-http-fastapi
starlette
azure-functions
pyodbc
openai
uvicorn
starlette
openai
msal
requests
langchain
langgraph
pyjwt
azure.identity
azure.keyvault.secrets
pydantic
typing-extensions
opencensus-ext-azure
opencensus
sqlalchemy
spacy
python-levenshtein
fuzzywuzzy


pip freeze | grep -E "^($(sed 's/[><=].*//g' requirements.txt | tr '\n' '|' | sed 's/|$//'))"