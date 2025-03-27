import pyodbc
import db_helper

def execute_sql_query(sql_query):
    """Executes a SQL query against Azure SQL Database and returns the results."""
    try:
        connection_string = db_helper.get_connection_string()
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