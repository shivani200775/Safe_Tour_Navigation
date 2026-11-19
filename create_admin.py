
from backend.database import get_db_connection
from werkzeug.security import generate_password_hash
from getpass import getpass

print("===== SAFE TOUR ADMIN CREATION =====")

name = input("Enter Admin Name: ").strip()
email = input("Enter Admin Email: ").strip().lower()

password = getpass("Create Admin Password: ")
confirm_password = getpass("Confirm Admin Password: ")

if not name or not email or not password:
    print("All fields are required.")

elif len(password) < 8:
    print("Password must be at least 8 characters.")

elif password != confirm_password:
    print("Passwords do not match.")

else:
    conn = get_db_connection()

    try:
        conn.execute(
            """
            INSERT INTO admins (name, email, password)
            VALUES (?, ?, ?)
            """,
            (name, email, generate_password_hash(password))
        )

        conn.commit()
        print("Admin account created successfully!")

    except Exception as error:
        if "UNIQUE constraint failed" in str(error):
            print("This admin email already exists.")
        else:
            print("Error creating admin account:", error)

    finally:
        conn.close()
