
import os

from flask import Flask, send_from_directory, session, redirect

from database import (
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

print("Frontend Folder:", FRONTEND_FOLDER)

print(
    "Admin File Exists:",
    os.path.exists(os.path.join(FRONTEND_FOLDER, "admin.html"))
)


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
# 4. REGISTER AUTHENTICATION ROUTES
# =====================================

app.register_blueprint(auth)


# =====================================
# 5. DATABASE INITIALIZATION
# =====================================

create_users_table()
create_safety_reports_table()
create_admins_table()
create_restricted_places_table()


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
# 7. USER DASHBOARD
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
# 8. ADMIN LOGIN PAGE
# =====================================

@app.route("/admin.html")
def admin_page():

    return send_from_directory(
        FRONTEND_FOLDER,
        "admin.html"
    )


# =====================================
# 9. OTHER FRONTEND PAGES
# =====================================

@app.route("/&lt;page&gt;")
def pages(page):

    allowed_pages = [
        "login.html",
        "register.html",
        "route.html"
    ]

    if page in allowed_pages:

        return send_from_directory(
            FRONTEND_FOLDER,
            page
        )

    return "Page not found", 404


# =====================================
# 10. RUN APPLICATION
# =====================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )
