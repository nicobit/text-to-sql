import os
import pyodbc  # using pyodbc for SQL Server; ensure ODBC Driver is available in the Azure Function environment

# Connection string from environment (should be in Azure Function App settings for production)
conn_str = os.getenv("AZURE_SQL_CONNECTION_STRING")  # e.g., Driver={ODBC Driver 18 for SQL Server};Server=<...>;Database=<...>;Uid=<...>;Pwd=<...>;

# For performance, establish a single global connection or connection pool
connection = pyodbc.connect(conn_str)  # Consider using fast_executemany or connection pooling as needed

def run_query(sql: str):
    """
    Execute the given SQL query and return column names and rows.
    """
    cursor = connection.cursor()
    cursor.execute(sql)
    columns = [column[0] for column in cursor.description]
    rows = cursor.fetchall()
    # Convert rows (pyodbc row objects) to list of values
    rows = [list(row) for row in rows]
    return columns, rows