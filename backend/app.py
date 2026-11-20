from werkzeug.security import generate_password_hash
import os

from flask import Flask, send_from_directory, session, redirect

from database import (
        get_db_connection,
    create_users_table,
    create_safety_reports_table,
    create_admins_table,
    create_restricted_places_table
)

from routes import auth


# =====================================
# 1. PROJECT PATHS
# =====================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

FRONTEND_FOLDER = os.path.join(BASE_DIR, "frontend")


# =====================================
# 2. FLASK APPLICATION
# =====================================

app = Flask(
    __name__,
    static_folder=FRONTEND_FOLDER,
    static_url_path="/static"
)


# =====================================
# 3. SECRET KEY
# =====================================

app.secret_key = os.environ.get(
    "SECRET_KEY",
    "local-development-secret-key"
)


# =====================================
# 4. REGISTER BLUEPRINT
# =====================================

app.register_blueprint(auth)
def create_default_admin():

    email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    password = os.environ.get("ADMIN_PASSWORD", "")

    if not email or not password:
        print("Admin environment variables missing.")
        return

    conn = get_db_connection()

    try:
        admin = conn.execute(
            "SELECT id FROM admins WHERE email = ?",
            (email,)
        ).fetchone()

        if not admin:
            conn.execute("""
                INSERT INTO admins (name, email, password)
                VALUES (?, ?, ?)
            """, (
                "Shivani",
                email,
                generate_password_hash(password)
            ))

            conn.commit()
            print("Admin account created successfully.")

        else:
            print("Admin account already exists.")

    finally:
        conn.close()


# =====================================
# 5. DATABASE INITIALIZATION
# =====================================

create_users_table()
create_safety_reports_table()
create_admins_table()
create_restricted_places_table()
create_default_admin()


# =====================================
# 6. HOME PAGE
# =====================================

@app.route("/")
@app.route("/index.html")
def home():

    return send_from_directory(
        FRONTEND_FOLDER,
        "index.html"
    )


# =====================================
# 7. LOGIN PAGE
# =====================================

@app.route("/login.html")
def login_page():

    return send_from_directory(
        FRONTEND_FOLDER,
        "login.html"
    )


# =====================================
# 8. REGISTER PAGE
# =====================================

@app.route("/register.html")
def register_page():

    return send_from_directory(
        FRONTEND_FOLDER,
        "register.html"
    )


# =====================================
# 9. USER DASHBOARD
# =====================================

@app.route("/dashboard.html")
def dashboard():

    if "user_id" not in session:
        return redirect("/login.html")

    return send_from_directory(
        FRONTEND_FOLDER,
        "dashboard.html"
    )


# =====================================
# 10. ADMIN PAGE
# =====================================

@app.route("/admin.html")
def admin_page():

    return send_from_directory(
        FRONTEND_FOLDER,
        "admin.html"
    )


# =====================================
# 11. ROUTE PAGE
# =====================================

@app.route("/route.html")
def route_page():

    return send_from_directory(
        FRONTEND_FOLDER,
        "route.html"
    )


# =====================================
# 12. RUN APPLICATION
# =====================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )
