from app.utils.connection_string_parser import ConnectionStringParser

connection_string = "Driver={ODBC Driver 17 for SQL Server};Server=tcp:your_server.database.windows.net,1433;Database=your_database;Uid=your_username;Pwd=your_password;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;"
parsed = ConnectionStringParser.parse(connection_string)
#retval = ConnectionStringParser.setConnectionStringWithDatabase(connection_string, "new_database")
#if "new_database" in retval:
#    print("Database updated successfully.")
#             # Parse the URL-style connection string   
#             url = urlparse(connection_string)


