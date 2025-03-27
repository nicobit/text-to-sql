import pyodbc
from config import AZURE_SQL_SERVER, AZURE_SQL_DATABASE, AZURE_SQL_USER, AZURE_SQL_PASSWORD

conn_str = (
    f"DRIVER={{ODBC Driver 18 for SQL Server}};"
    f"SERVER={AZURE_SQL_SERVER};DATABASE={AZURE_SQL_DATABASE};"
    f"UID={AZURE_SQL_USER};PWD={AZURE_SQL_PASSWORD};"
    "Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
)

connection = pyodbc.connect(conn_str)
cursor = connection.cursor()

def execute_query(sql_query: str, params: tuple = None) -> list:
    """
    Execute the given SQL query securely and return results.
    Only SELECT queries are expected.
    """
    if params:
        cursor.execute(sql_query, params)
    else:
        cursor.execute(sql_query)
    rows = cursor.fetchall()
    return [tuple(row) for row in rows]