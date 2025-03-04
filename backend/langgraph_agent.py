from openai import AzureOpenAI
import logging

class LangGraphAgent:
    def __init__(self, endpoint, api_key, deployment_name):
        self.endpoint = endpoint
        self.api_key = api_key
        self.deployment_name = deployment_name
        

       #   api_key=os.getenv("AZURE_OPENAI_API_KEY"),  
        #  api_version="2024-07-01-preview",
         # azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")


        #api_type = "azure",
        self.client = AzureOpenAI(
            api_key=self.api_key,
            azure_endpoint = self.endpoint,
            
        # api_base = self.endpoint,
            api_version = "2025-01-01-preview",
        )

    async def generate_sql(self, user_query, schema):
        """Generates an SQL query from a natural language query."""
        prompt = f"""
        You are an expert SQL assistant. Below is the schema of an Azure SQL Database:
        {schema}

        Convert the user's question into a valid SQL query:
        User Question: "{user_query}"
        SQL Query:
        """

        logging.info(f"prompt {prompt}")
        try:
            response =  self.client.chat.completions.create(
                model = self.deployment_name,
                messages = [
                    {
                        "role": "system",
                        "content": "You are an expert SQL generator."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                
               
                max_tokens= 150,
                temperature=0.8 , # Deterministic output
            )
            response_message = response.choices[0].message.content

            response_message = response_message.replace("```sql", "").strip()
            response_message = response_message.replace("```", "").strip()


            return response_message
        except Exception as e:
            logging.info(f"deployment name {self.deployment_name}")
            logging.info(f"prompt {prompt}")
            logging.error(f"Error in OpenAI call: {str(e)}")
            raise