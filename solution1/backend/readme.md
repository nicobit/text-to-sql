# Deployment

Before you publish, run the following command to install the dependencies locally:

 pip install  --target=".python_packages/lib/site-packages"  -r requirements.txt


To deploy by commnand line :

az functionapp deployment source config-zip --resource-group 'ai-poc-rg' --name 'nicbit-ai-func' --src 'function_app.zip' --build-remote true

To Test:
Invoke-RestMethod -Uri "https://nicbit-ai-func.azurewebsites.net/query" -Method Post -Body (@{ query  = "value"; session_id = "test" } | ConvertTo-Json -Depth 10 ) -ContentType "application/json"