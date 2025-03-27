import pyodbc
from azure.identity import ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient
from app.settings import USE_KEY_VAULT_TO_GET_CONNECTION_STRING, KEY_VAULT_URI, SQL_CONNECTION_STRING_SECRET_NAME, SQL_CONNECTION_STRING
from app.utils.nb_logger import NBLogger  

logger = NBLogger().Log()

class DBHelper:
    def __init__(self):
        self.connection_string = ""

    def credential(self):
    # Create Managed Identity credential if using managed identity
        return ManagedIdentityCredential()


    def executeSQLQuery(self,sql_query):
        """Executes a SQL query against Azure SQL Database and returns the results."""
        try:
            connection_string = self.getConnectionString()
            conn = pyodbc.connect(connection_string)
            cursor = conn.cursor()
            cursor.execute(sql_query)
            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()
            conn.close()

            results = [dict(zip(columns, row)) for row in rows]
            return results

        except Exception as e:
            
            raise
    
    def getConnectionString(self):
        if self.connection_string:
            return self.connection_string
        else:
            if USE_KEY_VAULT_TO_GET_CONNECTION_STRING:
                # Fetch the connection string from Key Vault
                try:
                    logger.info("Fetching SQL connection string from Azure Key Vault using Managed Identity.")
                    client = SecretClient(vault_url=KEY_VAULT_URI, credential=self.credential())
                    secret = client.get_secret(SQL_CONNECTION_STRING_SECRET_NAME)
                    self.connection_string = secret.value
                    logger.info("Connection string retrieved successfully from Key Vault.")
                    
                except Exception as e:
                    logger.error(f"Error fetching connection string from Key Vault: {str(e)}")
                    raise
            else:
                # If not using Key Vault, fallback to environment variable (or direct connection string)
                self.connection_string = SQL_CONNECTION_STRING
                if not self.connection_string:
                    logger.error("SQL connection string not found in environment variables.")
                    raise ValueError("SQL connection string is not available.")
                logger.info("Using connection string from environment variables.")
        return self.connection_string
    
    def getDBSchema(self):
        schema = {}
        try:
            connection_string = self.getConnectionString()
            conn = pyodbc.connect(connection_string)
            cursor = conn.cursor()

            # Get table and column names
            cursor.execute("SELECT ( TABLE_SCHEMA + '.' + TABLE_NAME ) as TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS")
            
            for table, column in cursor.fetchall():
                if table not in schema:
                    schema[table] = []
                schema[table].append(column)

            conn.close()
            logger.info("Schema cached successfully.")

            return schema

        except Exception as e:
            logger.error(f"Schema inference failed: {str(e)}")
            return {}
