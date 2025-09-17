# pip install azure-identity openai
from azure.identity import VisualStudioCodeCredential
from openai import AzureOpenAI

TENANT_ID = "<TENANT_ID>"
PROXY_APP_ID = "<PROXY_APP_ID>"

TOKEN = VisualStudioCodeCredential(tenant_id=TENANT_ID).get_token(f"api:{PROXY_APP_ID}/.default").token

client = AzureOpenAI(api_key="x", api_version="2024-06-01", azure_endpoint="https://<your-function>.azurewebsites.net")
client.default_headers = {"Authorization": f"Bearer {TOKEN}"}

resp = client.chat.completions.create(model="gpt-4o-mini",
    messages=[{"role":"user","content":"Hello via VS Code credential!"}]
)
print(resp.choices[0].message.content)