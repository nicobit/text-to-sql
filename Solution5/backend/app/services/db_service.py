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
from sqlalchemy import create_engine
from app.services.schema_engine import SchemaEngine
from app.services.m_schema import MSchema
import traceback
import xml.etree.ElementTree as ET

logger = NBLogger().Log()



class DBHelper:
    # Class variable to cache the connection string across calls.
    _cached_connection_string = ""
    _mschemas = {}

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
    def get_mschema(database: str) -> MSchema:
        """
        Returns the M-Schema for the specified database.
        """
        try:
            if  database not in DBHelper._mschemas:
                connection_string = DBHelper.getConnectionString(database)                                                
                params = ConnectionStringParser.quote(connection_string)
                logger.info(f"Database: {database}")
                db_engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")
                
                logger.info(f"Engine created")
                schema_engine = SchemaEngine(engine=db_engine, db_name=database)
                 
                DBHelper._mschemas[database] = schema_engine.mschema
            
            mschema = DBHelper._mschemas[database]
            return mschema
        except Exception as e:
            #logger.error(f"Schema inference failed: {str(e.)}")
            error_details = traceback.format_exc()
            logger.error("An error occurred:\n%s", error_details)
            return {}

    @staticmethod
    def get_mschema_tables(database: str) -> dict:
        """
        Returns the M-Schema for the specified database.
        """
        schema = {}
        try:
            
            mschema = DBHelper.get_mschema(database)
            tables = mschema.tables

            logger.error (mschema.to_mschema())

            for table_name, table_info in tables.items():
                mschemaTable = mschema.single_table_mschema(table_name)
                
                if table_name not in schema:
                    schema[table_name] = []

                schema[table_name].append(mschemaTable)
               
            return schema
        except Exception as e:
            #logger.error(f"Schema inference failed: {str(e.)}")
            error_details = traceback.format_exc()
            logger.error("An error occurred:\n%s", error_details)
            return {}


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
    
    @staticmethod
    def get_query_plan_description_mssql(database,sql_query):
        """
        Generates a human-readable description of the SQL Server query execution plan.
        
        Parameters:
            server (str): SQL Server name or IP address.
            database (str): Database name.
            username (str): Username for authentication.
            password (str): Password for authentication.
            sql_query (str): The SQL query to analyze.
        
        Returns:
            str: A detailed description of the query execution plan.
        """
        # Connect to the SQL Server database
        connection_string = DBHelper.getConnectionString(database)
        connection = pyodbc.connect(connection_string)
        cursor = connection.cursor()
        
        # Enable SHOWPLAN_XML to get the execution plan without executing the query
        cursor.execute("SET SHOWPLAN_XML ON")
        cursor.nextset()  # Move to the next result set
        
        # Execute the query to get the execution plan
        cursor.execute(sql_query)
        plan_xml = cursor.fetchone()[0]
        
        # Reset SHOWPLAN_XML to OFF
        cursor.execute("SET SHOWPLAN_XML OFF")
        cursor.nextset()
        
        # Close the connection
        connection.close()
        
        # Parse the XML execution plan
        root = ET.fromstring(plan_xml)
        namespaces = {'sql': 'http://schemas.microsoft.com/sqlserver/2004/07/showplan'}
        
        descriptions = []
        for stmt in root.findall('.//sql:StmtSimple', namespaces):
            statement_text = stmt.attrib.get('StatementText', '').strip()
            statement_type = stmt.attrib.get('StatementType', '').strip()
            descriptions.append(f"{statement_type} Statement: {statement_text}")
            
            for operator in stmt.findall('.//sql:RelOp', namespaces):
                op_type = operator.attrib.get('PhysicalOp', '').strip()
                logical_op = operator.attrib.get('LogicalOp', '').strip()
                descriptions.append(f"  - {logical_op} operation using {op_type}")
        
        return "\n".join(descriptions)

    @staticmethod
    def get_execution_plan_xml(database,sql_query):
        """
        Connects to SQL Server, sets SHOWPLAN_XML ON, executes the SQL query
        (without running it) and returns the execution plan as XML.
        """
        conn_str = DBHelper.getConnectionString(database)
        connection = pyodbc.connect(conn_str)
        cursor = connection.cursor()

        # Enable SHOWPLAN_XML (this tells SQL Server to return the plan without executing the query)
        cursor.execute("SET SHOWPLAN_XML ON")
        # Move to next result set if needed
        cursor.nextset()

        # Execute the query – note: it will not run the query, just return the plan
        cursor.execute(sql_query)
        row = cursor.fetchone()
        if row:
            plan_xml = row[0]
        else:
            plan_xml = None

        # Turn off SHOWPLAN_XML
        cursor.execute("SET SHOWPLAN_XML OFF")
        cursor.nextset()
        connection.close()

        return plan_xml

    @staticmethod
    def parse_query_plan(plan_xml):
        """
        Parses the XML execution plan and converts it into a human-readable description.
        This implementation focuses on a few common operations.
        """
        if plan_xml is None:
            return "No execution plan was returned."

        # Parse the XML
        root = ET.fromstring(plan_xml)
        # SQL Server execution plan XML uses a namespace – get its URL from the root tag
        ns = {'sql': root.tag.split('}')[0].strip('{')}

        descriptions = []
        # For each simple statement in the plan
        for stmt in root.findall('.//sql:StmtSimple', ns):
            statement_text = stmt.attrib.get('StatementText', '').strip()
            statement_type = stmt.attrib.get('StatementType', '').strip()
            descriptions.append(f"{statement_type} Statement: {statement_text}")

            # Look for relational operators (RelOp elements)
            for relop in stmt.findall('.//sql:RelOp', ns):
                physical_op = relop.attrib.get('PhysicalOp', '').strip()
                logical_op = relop.attrib.get('LogicalOp', '').strip()
                detail = f"  - {logical_op} operation using {physical_op}"
                # Try to extract additional info, e.g., object names for scans or searches
                for node in relop.findall('.//sql:IndexScan', ns):
                    table = node.attrib.get('Table', 'Unknown table')
                    detail += f" on table {table}"
                for node in relop.findall('.//sql:IndexSeek', ns):
                    table = node.attrib.get('Table', 'Unknown table')
                    detail += f" on table {table}"
                descriptions.append(detail)
        return "\n".join(descriptions)

    @staticmethod
    def generate_human_readable_plan(database,sql_query):
        """
        Connects to the SQL Server, retrieves the execution plan for a given query,
        and returns a human-readable description.
        """
        plan_xml = DBHelper.get_execution_plan_xml( database,  sql_query)
        description = DBHelper.parse_query_plan(plan_xml)
        return description

    @staticmethod
    def a_get_execution_plan(conn, sql_query):
        """
        Executes the given SQL query with SET STATISTICS XML ON and returns the XML execution plan.
        Note: In MSSQL, after the result set, the XML execution plan is returned as an additional result set.
        """
        cursor = conn.cursor()
        # Enable XML statistics
        cursor.execute("SET STATISTICS XML ON;")
        # Execute the query (this may return a result set that you can discard)
        cursor.execute(sql_query)
        # Fetch all rows from the main result set (if needed)
        try:
            _ = cursor.fetchall()
        except Exception:
            pass  # Some queries might not return rows

        # Advance to the next result set, which should contain the execution plan
        if cursor.nextset():
            # MSSQL returns the execution plan as a single-row, single-column result (XML string)
            plan_row = cursor.fetchone()
            if plan_row:
                return plan_row[0]
        return None




    @staticmethod
    def a_parse_execution_plan(xml_plan):
        """
        Parses the XML execution plan and returns a list of human-readable step descriptions.
        This example simply iterates over all <RelOp> nodes and extracts the PhysicalOp, LogicalOp,
        and EstimatedTotalSubtreeCost attributes.
        """

        steps = []

        try:

            root = ET.fromstring(xml_plan)

        except ET.ParseError as e:

            logger.error("Error parsing XML execution plan:", e)

            return steps



        # Traverse all RelOp nodes in the plan (they represent relational operators)

        for relop in root.iter('RelOp'):

            physical_op = relop.get('PhysicalOp', 'N/A')

            logical_op = relop.get('LogicalOp', 'N/A')

            cost = relop.get('EstimatedTotalSubtreeCost', 'N/A')

            # Create a simple text description for this operator

            step_desc = f"{physical_op} ({logical_op}) with cost {cost}"

            steps.append(step_desc)

        return steps



    @staticmethod
    def a_generate_prompt(schema, sql_query, execution_steps):

        """

        Combines the schema, the SQL query, and the execution plan steps into a final prompt.

        The prompt is intended to be human-readable and can be sent to an LLM.

        """

        prompt = "Below is the SQL table schema:\n"

        prompt += schema + "\n\n"

        prompt += "For the following query:\n"

        prompt += sql_query + "\n\n"

        prompt += "The execution plan was as follows:\n"

        for i, step in enumerate(execution_steps, start=1):

            prompt += f"Step {i}: {step}\n"

        prompt += "\nPlease provide a human-readable explanation of the above execution plan."

        return prompt

    @staticmethod
    def test(database, sql_query, schema):
         # Get the XML execution plan from MSSQL

        conn_str = DBHelper.getConnectionString(database)
        conn = pyodbc.connect(conn_str)
        xml_plan = DBHelper.get_execution_plan_xml(database, sql_query)

        if xml_plan is None:

            logger.error("Failed to retrieve execution plan.")

            return



        # Parse the XML into human-readable steps

        execution_steps = DBHelper.a_parse_execution_plan(xml_plan)

        if not execution_steps:

            logger.error("No execution steps found in the plan.")

            return



        # Generate the final prompt combining schema, query, and execution plan steps

        final_prompt = DBHelper.a_generate_prompt(schema, sql_query, execution_steps)

        return final_prompt