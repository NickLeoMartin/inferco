
import psycopg2

def get_postgres_schema_information(host: str, port: int, dbname: str, username: str, password: str) -> None:
    """
    Function to connect to a PostgreSQL database and retrieves the table definitions and keys.

    :param host: Database host address
    :param port: Database port
    :param dbname: Name of the database
    :param username: Username for the database
    :param password: Password for the database
    :return: None
    """
    try:
        # Connect to the PostgreSQL database
        conn = psycopg2.connect(
            host=host,
            port=port,
            dbname=dbname,
            user=username,
            password=password
        )
        # Create a new cursor
        cur = conn.cursor()

        # Query to get table definitions
        cur.execute("""
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
        """)
        table_definitions = cur.fetchall()
        for table in table_definitions:
            print(f"Table: {table[0]}, Column: {table[1]}, Type: {table[2]}")

        # Query to get table keys (Primary keys and Foreign keys)
        cur.execute("""
            SELECT tc.table_name, kcu.column_name, tc.constraint_type
            FROM information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            WHERE tc.table_schema = 'public'
        """)
        table_keys = cur.fetchall()
        for key in table_keys:
            print(f"Table: {key[0]}, Key Column: {key[1]}, Constraint Type: {key[2]}")

        # Close the cursor and the connection
        cur.close()
        conn.close()

    except Exception as e:
        print(f"An error occurred: {e}")

# Example usage of the function:
# get_postgres_table_definitions('127.0.0.1', '5432', 'world-db', 'world', 'world123')