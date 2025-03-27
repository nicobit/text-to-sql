#!/bin/bash
# Variables (set these to your values)
RESOURCE_GROUP="<your-resource-group>"
LOCATION="<your-region>"            # e.g., "westeurope" or "eastus"
STORAGE_ACCOUNT="<yourstorageacct>" # must be globally unique
FUNCTION_APP="<your-function-app-name>"  # must be unique
# (Optional) Azure Cognitive Search and OpenAI details if setting via CLI
SEARCH_SERVICE="<your-search-service-name>"
SEARCH_API_KEY="<your-search-admin-key>"
SQL_CONN_STRING="<your-AzureSQL-connection-string>"
OPENAI_API_KEY="<your-openai-api-key>"

# Create Resource Group
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

# Create Storage Account for Function App (required for Functions)
az storage account create --name "$STORAGE_ACCOUNT" --location "$LOCATION" \
    --resource-group "$RESOURCE_GROUP" --sku Standard_LRS

# Create the Function App on a Consumption Plan (Python runtime)
az functionapp create --name "$FUNCTION_APP" --storage-account "$STORAGE_ACCOUNT" \
    --consumption-plan-location "$LOCATION" --resource-group "$RESOURCE_GROUP" \
    --functions-version 4 --runtime python --runtime-version 3.10  ([Create a serverless function app using the Azure CLI | Microsoft Learn](https://learn.microsoft.com/en-us/azure/azure-functions/scripts/functions-cli-create-serverless#:~:text=,version%20%24functionsVersion))

# Configure app settings (connection strings and keys for external services)
az functionapp config appsettings set --name "$FUNCTION_APP" --resource-group "$RESOURCE_GROUP" --settings \
    AzureSearchServiceName="$SEARCH_SERVICE" \
    AzureSearchApiKey="$SEARCH_API_KEY" \
    AzureSearchIndexName="nl2sql-index" \
    AzureSQLConnectionString="$SQL_CONN_STRING" \
    OpenAIKey="$OPENAI_API_KEY"

# Deploy the function code by zip push deployment
echo "Creating deployment package..."
zip -r function.zip . -x "local.settings.json" -x "*.git*" -x "*.vscode*"
echo "Deploying to Azure..."
az functionapp deployment source config-zip --name "$FUNCTION_APP" --resource-group "$RESOURCE_GROUP" --src function.zip

echo "Deployment completed. Function App URL:"
FUNC_URL="https://$FUNCTION_APP.azurewebsites.net/nl2sql?code=<FUNCTION_KEY>"
echo "$FUNC_URL"