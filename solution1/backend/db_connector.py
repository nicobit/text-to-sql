import pyodbc
import logging

def execute_sql_query(sql_query, connection_string):
    """Executes a SQL query against Azure SQL Database and returns the results."""
    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()
        cursor.execute(sql_query)
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        conn.close()

        results = [dict(zip(columns, row)) for row in rows]
        return results

    except Exception as e:
        logging.error(f"Database query failed: {str(e)}")
        raise