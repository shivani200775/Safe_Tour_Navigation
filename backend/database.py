
import sqlite3
import os

# =====================================
# DATABASE FILE PATH
# =====================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_PATH = os.path.join(BASE_DIR, "safe_tour.db")


# =====================================
# DATABASE CONNECTION
# =====================================

def get_db_connection():

    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row

    return conn


# =====================================
# 1. CREATE USERS TABLE
# =====================================

def create_users_table():

    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


# =====================================
# 2. CREATE SAFETY REPORTS TABLE
# =====================================

def create_safety_reports_table():

    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS safety_reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            location TEXT NOT NULL,
            latitude REAL,
            longitude REAL,
            report_type TEXT NOT NULL,
            description TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()


# =====================================
# 3. CREATE ADMINS TABLE
# =====================================

def create_admins_table():

    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


# =====================================
# 4. CREATE RESTRICTED PLACES TABLE
# =====================================

def create_restricted_places_table():

    conn = get_db_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS restricted_places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            place_name TEXT NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL,
            radius REAL DEFAULT 100,
            reason TEXT NOT NULL,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


# =====================================
# 5. RUN DATABASE SETUP
# =====================================

if __name__ == "__main__":

    create_users_table()
    create_safety_reports_table()
    create_admins_table()
    create_restricted_places_table()

    print("Database created successfully!")
    print("Users table is ready.")
    print("Safety reports table is ready.")
    print("Admins table is ready.")
    print("Restricted places table is ready.")
