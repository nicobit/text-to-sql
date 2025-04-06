import os, pyodbc

# Read database connection settings from environment
_DB_SERVER = os.getenv("DB_SERVER")
_DB_NAME   = os.getenv("DB_NAME")
_DB_USER   = os.getenv("DB_USER")
_DB_PASS   = os.getenv("DB_PASSWORD")
_DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")

# Construct ODBC connection string
_CONN_STR = (
    f"DRIVER={{{_DB_DRIVER}}};"   # note: driver name in { braces }
    f"SERVER={_DB_SERVER};"
    f"DATABASE={_DB_NAME};"
    f"UID={_DB_USER};"
    f"PWD={_DB_PASS};"
    "TrustServerCertificate=yes;"
)

def get_schema_summary() -> str:
    """Connect to the DB and retrieve a summary of tables and columns (M-Schema style description)."""
    conn = pyodbc.connect(_CONN_STR)
    cursor = conn.cursor()
    # Fetch all user tables
    tables = cursor.execute(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'"
    ).fetchall()
    schema_lines = []
    for (table_name,) in tables:
        # Get columns for each table
        cols = cursor.execute(
            "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=?", table_name
        ).fetchall()
        # Format columns as name (type)
        col_desc = ", ".join(f"{col} ({dtype})" for col, dtype in cols)
        schema_lines.append(f"Table `{table_name}` with columns: {col_desc}")
    cursor.close()
    conn.close()
    # Join all table descriptions
    if not schema_lines:
        return "No tables found in database."
    return "; ".join(schema_lines)

def run_query(sql: str, limit: int = 10) -> str:
    """Execute the given SQL query and return up to `limit` rows as a formatted string."""
    conn = pyodbc.connect(_CONN_STR)
    cursor = conn.cursor()
    cursor.execute(sql)
    # If it's a SELECT, fetch results
    # (We assume generator produces SELECT queries only; safeguard against modifications.)
    sql_lower = sql.strip().lower()
    if sql_lower.startswith("select") or sql_lower.startswith("with"):
        rows = cursor.fetchmany(limit)
        columns = [column[0] for column in cursor.description] if cursor.description else []
        cursor.close()
        conn.close()
        # Format results into a string (e.g., pipe-separated columns)
        if not rows:
            return "No results."
        # Prepare header and rows
        header = " | ".join(str(col) for col in columns)
        lines = [header]
        for row in rows:
            # Join each row's values as strings
            line = " | ".join(str(val) for val in row)
            lines.append(line)
        # Indicate if there are possibly more rows not shown
        if len(rows) == limit:
            lines.append(f"... (limited to {limit} rows)")
        return "\n".join(lines)
    else:
        # For non-select queries, just indicate success (or warn)
        cursor.close()
        conn.close()
        return f"Query executed: {sql}"