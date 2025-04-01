import pyodbc
from azure.identity import ManagedIdentityCredential
from azure.keyvault.secrets import SecretClient
from app.settings import (
    CONNECTION_STRING_RETRIEVER, 
    KEY_VAULT_URI, 
    SQL_CONNECTION_STRING_SECRET_NAME, 
    SQL_CONNECTION_STRING, 
    DATABASE_DNS_SECRET_NAME, 
    USERNAME_SECRET_NAME, 
    PASSWORD_SECRET_NAME, 
    DATABASE_NAME, 
    ODBC_DRIVER
)
from app.utils.nb_logger import NBLogger  
from app.utils.connection_string_parser import ConnectionStringParser

logger = NBLogger().Log()

class DBHelper:
    # Class variable to cache the connection string across calls.
    _cached_connection_string = ""

    @staticmethod
    def credential():
        """Create Managed Identity credential if using managed identity."""
        return ManagedIdentityCredential()

    @staticmethod
    def executeSQLQuery(database, sql_query):
        """
        Executes a SQL query against Azure SQL Database and returns the results.
        """
        try:
            connection_string = DBHelper.getConnectionString(database)
            conn = pyodbc.connect(connection_string)
            cursor = conn.cursor()
            cursor.execute(sql_query)
            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()
            conn.close()

            results = [dict(zip(columns, row)) for row in rows]
            return results

        except Exception as e:
            logger.error(f"Error executing SQL query: {e}")
            raise

    @staticmethod
    def getConnectionString(database: str) -> str:
        """
        Retrieves the connection string, caching it on the class level.
        If a specific database is provided (and it's not "default"), the connection
        string is modified to include that database.
        """
        if DBHelper._cached_connection_string:
            base_connection_string = DBHelper._cached_connection_string
        else:
            if CONNECTION_STRING_RETRIEVER == "keyvault_connection_string":
                try:
                    logger.info("Fetching SQL connection string from Azure Key Vault using Managed Identity.")
                    client = SecretClient(vault_url=KEY_VAULT_URI, credential=DBHelper.credential())
                    secret = client.get_secret(SQL_CONNECTION_STRING_SECRET_NAME)
                    base_connection_string = secret.value
                    DBHelper._cached_connection_string = base_connection_string
                    logger.info("Connection string retrieved successfully from Key Vault.")
                except Exception as e:
                    logger.error(f"Error fetching connection string from Key Vault: {str(e)}")
                    raise
            elif CONNECTION_STRING_RETRIEVER == "connection_string":
                base_connection_string = SQL_CONNECTION_STRING
                if not base_connection_string:
                    logger.error("SQL connection string not found in environment variables.")
                    raise ValueError("SQL connection string is not available.")
                DBHelper._cached_connection_string = base_connection_string
                logger.info("Using connection string from environment variables.")
            elif CONNECTION_STRING_RETRIEVER == "keyvault":
                try:
                    logger.info("Fetching database credentials from Azure Key Vault using Managed Identity.")
                    client = SecretClient(vault_url=KEY_VAULT_URI, credential=DBHelper.credential())
                    database_dns = client.get_secret(DATABASE_DNS_SECRET_NAME).value
                    username = client.get_secret(USERNAME_SECRET_NAME).value
                    password = client.get_secret(PASSWORD_SECRET_NAME).value

                    base_connection_string = (
                        f"Driver={ODBC_DRIVER};Server={database_dns};Database={DATABASE_NAME};"
                        f"UID={username};PWD={password};Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
                    )
                    DBHelper._cached_connection_string = base_connection_string
                    logger.info("Connection string constructed successfully.")
                except Exception as e:
                    logger.error(f"Error fetching credentials from Key Vault: {str(e)}")
                    raise

        if (not database or database == "default") or database == "":
            return base_connection_string
        else:
            return ConnectionStringParser.setConnectionStringWithDatabase(base_connection_string, database)

    @staticmethod
    def getDBName(databaseInput):
        connectionString = DBHelper.getConnectionString(databaseInput)
        retval = ConnectionStringParser.parse(connectionString)["database"]
        return retval

    @staticmethod
    def getDBSchema(database: str) -> dict:
        schema = {}
        try:
            connection_string = DBHelper.getConnectionString(database)
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

    @staticmethod
    def getDatabases() -> list:
        """
        Returns a list of user databases available in the SQL server, excluding system databases.
        """
        try:
            connection_string = DBHelper.getConnectionString("master")  # Connect to the master database
            conn = pyodbc.connect(connection_string)
            cursor = conn.cursor()

            cursor.execute("""
                SELECT name 
                FROM sys.databases 
                WHERE state = 0 AND name NOT IN ('master', 'tempdb', 'model', 'msdb')
            """)
            databases = [row[0] for row in cursor.fetchall()]
            conn.close()
            logger.info("User database list retrieved successfully.")
            return databases
        except Exception as e:
            logger.error(f"Failed to retrieve database list: {str(e)}")
            raise
