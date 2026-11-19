
from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection
from math import radians, sin, cos, sqrt, atan2

auth = Blueprint("auth", __name__)


# =====================================
# HELPER: CHECK COORDINATES
# =====================================

def valid_coordinates(latitude, longitude):

    try:
        latitude = float(latitude)
        longitude = float(longitude)

        if not -90 <= latitude <= 90:
            return None

        if not -180 <= longitude <= 180:
            return None

        return latitude, longitude

    except (ValueError, TypeError):
        return None


# =====================================
# HELPER: CALCULATE DISTANCE
# =====================================

def calculate_distance(lat1, lon1, lat2, lon2):

    earth_radius = 6371000

    lat1 = radians(lat1)
    lon1 = radians(lon1)
    lat2 = radians(lat2)
    lon2 = radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        sin(dlat / 2) ** 2
        + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    return earth_radius * c


# =====================================
# 1. USER REGISTRATION
# =====================================

@auth.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request"}), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    if len(password) < 8:
        return jsonify({"message": "Password must be at least 8 characters"}), 400

    conn = get_db_connection()

    try:
        conn.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, generate_password_hash(password))
        )

        conn.commit()

        return jsonify({"message": "Registration successful!"}), 201

    except Exception as error:

        if "UNIQUE constraint failed" in str(error):
            return jsonify({"message": "Email already registered"}), 409

        return jsonify({"message": "Registration failed"}), 500

    finally:
        conn.close()


# =====================================
# 2. USER LOGIN
# =====================================

@auth.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    conn = get_db_connection()

    try:
        user = conn.execute(
            "SELECT * FROM users WHERE email = ?",
            (email,)
        ).fetchone()

        if user and check_password_hash(user["password"], password):

            session["user_id"] = user["id"]

            return jsonify({
                "message": "Login successful!",
                "name": user["name"]
            }), 200

        return jsonify({"message": "Invalid email or password"}), 401

    finally:
        conn.close()


# =====================================
# 3. USER LOGOUT
# =====================================

@auth.route("/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({"message": "Logged out successfully"}), 200


# =====================================
# 4. SUBMIT SAFETY REPORT
# =====================================

@auth.route("/submit-report", methods=["POST"])
def submit_report():

    if "user_id" not in session:
        return jsonify({"message": "Please login first"}), 401

    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request"}), 400

    location = data.get("location", "").strip()
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    report_type = data.get("report_type", "").strip().lower()
    description = data.get("description", "").strip()

    if not location or not report_type or not description:
        return jsonify({"message": "All fields are required"}), 400

    allowed_report_types = [
        "pothole",
        "open_pit",
        "poor_lighting",
        "unsafe_structure",
        "road_blockage",
        "other",
        "caution",
        "danger"
    ]

    if report_type not in allowed_report_types:
        return jsonify({"message": "Invalid report type"}), 400

    try:
        if latitude is not None:
            latitude = float(latitude)

        if longitude is not None:
            longitude = float(longitude)

        if latitude is not None and not -90 <= latitude <= 90:
            raise ValueError()

        if longitude is not None and not -180 <= longitude <= 180:
            raise ValueError()

    except (ValueError, TypeError):
        return jsonify({"message": "Invalid coordinates"}), 400

    conn = get_db_connection()

    try:
        conn.execute("""
            INSERT INTO safety_reports
            (user_id, location, latitude, longitude,
             report_type, description)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            session["user_id"],
            location,
            latitude,
            longitude,
            report_type,
            description
        ))

        conn.commit()

        return jsonify({
            "message": "Safety report submitted successfully!",
            "status": "pending"
        }), 201

    finally:
        conn.close()


# =====================================
# 5. ADMIN AUTHENTICATION CHECK
# =====================================

def admin_required():

    return "admin_id" in session


# =====================================
# 6. ADMIN LOGIN
# =====================================

@auth.route("/admin-login", methods=["POST"])
def admin_login():

    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    conn = get_db_connection()

    try:
        admin = conn.execute(
            "SELECT * FROM admins WHERE email = ?",
            (email,)
        ).fetchone()

        if admin and check_password_hash(admin["password"], password):

            session.clear()
            session["admin_id"] = admin["id"]

            return jsonify({
                "message": "Admin login successful!",
                "name": admin["name"]
            }), 200

        return jsonify({"message": "Invalid admin email or password"}), 401

    finally:
        conn.close()


# =====================================
# 7. ADMIN VIEW ALL REPORTS
# =====================================

@auth.route("/admin/reports", methods=["GET"])
def admin_reports():

    if not admin_required():
        return jsonify({"message": "Admin login required"}), 401

    conn = get_db_connection()

    try:
        reports = conn.execute("""
            SELECT
                safety_reports.*,
                users.name AS user_name,
                users.email AS user_email
            FROM safety_reports
            LEFT JOIN users
            ON safety_reports.user_id = users.id
            ORDER BY safety_reports.created_at DESC
        """).fetchall()

        return jsonify({
            "reports": [dict(report) for report in reports]
        }), 200

    finally:
        conn.close()


# =====================================
# 8. ADMIN VERIFY OR REJECT REPORT
# =====================================

@auth.route("/admin/review-report/<int:report_id>", methods=["POST"])
def review_report(report_id):

    if not admin_required():
        return jsonify({"message": "Admin login required"}), 401

    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request"}), 400

    status = data.get("status", "").strip().lower()

    if status not in ["verified", "rejected"]:
        return jsonify({
            "message": "Status must be verified or rejected"
        }), 400

    conn = get_db_connection()

    try:
        report = conn.execute(
            "SELECT id FROM safety_reports WHERE id = ?",
            (report_id,)
        ).fetchone()

        if not report:
            return jsonify({"message": "Report not found"}), 404

        conn.execute(
            "UPDATE safety_reports SET status = ? WHERE id = ?",
            (status, report_id)
        )

        conn.commit()

        return jsonify({
            "message": f"Report {status} successfully!",
            "status": status
        }), 200

    finally:
        conn.close()


# =====================================
# 9. ADMIN LOGOUT
# =====================================

@auth.route("/admin-logout", methods=["POST"])
def admin_logout():

    session.pop("admin_id", None)

    return jsonify({
        "message": "Admin logged out successfully"
    }), 200


# =====================================
# 10. GET VERIFIED SAFETY REPORTS
# =====================================

@auth.route("/verified-reports", methods=["GET"])
def get_verified_reports():

    conn = get_db_connection()

    try:
        reports = conn.execute("""
            SELECT
                id,
                location,
                latitude,
                longitude,
                report_type,
                description,
                created_at
            FROM safety_reports
            WHERE status = 'verified'
            AND latitude IS NOT NULL
            AND longitude IS NOT NULL
            ORDER BY created_at DESC
        """).fetchall()

        return jsonify({
            "reports": [dict(report) for report in reports]
        }), 200

    finally:
        conn.close()


# =====================================
# 11. USER SAFETY REPORT HISTORY
# =====================================

@auth.route("/my-reports", methods=["GET"])
def get_my_reports():

    if "user_id" not in session:
        return jsonify({
            "message": "Please login first"
        }), 401

    user_id = session["user_id"]

    conn = get_db_connection()

    try:
        reports = conn.execute("""
            SELECT
                id,
                location,
                report_type,
                description,
                status,
                created_at
            FROM safety_reports
            WHERE user_id = ?
            ORDER BY created_at DESC
        """, (user_id,)).fetchall()

        return jsonify({
            "reports": [dict(report) for report in reports]
        }), 200

    finally:
        conn.close()


# =====================================
# 12. ADMIN ADD RESTRICTED PLACE
# =====================================

@auth.route("/admin/restricted-places", methods=["POST"])
def add_restricted_place():

    if not admin_required():
        return jsonify({"message": "Admin login required"}), 401

    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request"}), 400

    place_name = data.get("place_name", "").strip()
    reason = data.get("reason", "").strip()

    coordinates = valid_coordinates(
        data.get("latitude"),
        data.get("longitude")
    )

    try:
        radius = float(data.get("radius", 100))
    except (ValueError, TypeError):
        return jsonify({"message": "Invalid radius"}), 400

    if not place_name or not reason or not coordinates:
        return jsonify({
            "message": "Place name, reason and valid coordinates are required"
        }), 400

    if not 10 <= radius <= 5000:
        return jsonify({
            "message": "Radius must be between 10 and 5000 metres"
        }), 400

    latitude, longitude = coordinates

    conn = get_db_connection()

    try:
        cursor = conn.execute("""
            INSERT INTO restricted_places
            (place_name, latitude, longitude, radius, reason)
            VALUES (?, ?, ?, ?, ?)
        """, (
            place_name,
            latitude,
            longitude,
            radius,
            reason
        ))

        conn.commit()

        return jsonify({
            "message": "Restricted place added successfully!",
            "id": cursor.lastrowid
        }), 201

    finally:
        conn.close()


# =====================================
# 13. ADMIN VIEW RESTRICTED PLACES
# =====================================

@auth.route("/admin/restricted-places", methods=["GET"])
def get_restricted_places():

    if not admin_required():
        return jsonify({"message": "Admin login required"}), 401

    conn = get_db_connection()

    try:
        places = conn.execute("""
            SELECT *
            FROM restricted_places
            ORDER BY created_at DESC
        """).fetchall()

        return jsonify({
            "places": [dict(place) for place in places]
        }), 200

    finally:
        conn.close()


# =====================================
# 14. ADMIN ACTIVATE / DEACTIVATE PLACE
# =====================================

@auth.route("/admin/restricted-places/<int:place_id>/toggle",
            methods=["POST"])
def toggle_restricted_place(place_id):

    if not admin_required():
        return jsonify({"message": "Admin login required"}), 401

    conn = get_db_connection()

    try:
        place = conn.execute(
            "SELECT * FROM restricted_places WHERE id = ?",
            (place_id,)
        ).fetchone()

        if not place:
            return jsonify({"message": "Restricted place not found"}), 404

        new_status = 0 if place["is_active"] == 1 else 1

        conn.execute("""
            UPDATE restricted_places
            SET is_active = ?
            WHERE id = ?
        """, (new_status, place_id))

        conn.commit()

        return jsonify({
            "message": "Restricted place status updated!",
            "is_active": new_status
        }), 200

    finally:
        conn.close()


# =====================================
# 15. CHECK TOURIST GPS LOCATION
# =====================================

@auth.route("/check-restricted-place", methods=["POST"])
def check_restricted_place():

    if "user_id" not in session:
        return jsonify({"message": "Please login first"}), 401

    data = request.get_json()

    if not data:
        return jsonify({"message": "Invalid request"}), 400

    coordinates = valid_coordinates(
        data.get("latitude"),
        data.get("longitude")
    )

    if not coordinates:
        return jsonify({"message": "Invalid coordinates"}), 400

    user_latitude, user_longitude = coordinates

    conn = get_db_connection()

    try:
        places = conn.execute("""
            SELECT *
            FROM restricted_places
            WHERE is_active = 1
        """).fetchall()

        nearby_places = []

        for place in places:

            distance = calculate_distance(
                user_latitude,
                user_longitude,
                place["latitude"],
                place["longitude"]
            )

            if distance <= place["radius"]:

                nearby_places.append({
                    "id": place["id"],
                    "place_name": place["place_name"],
                    "reason": place["reason"],
                    "radius": place["radius"],
                    "distance": round(distance)
                })

        if nearby_places:
            return jsonify({
                "restricted": True,
                "message": "Warning! You are near a restricted place.",
                "places": nearby_places
            }), 200

        return jsonify({
            "restricted": False,
            "message": "No restricted place detected nearby.",
            "places": []
        }), 200

    finally:
        conn.close()


# =====================================
# 16. GET ACTIVE RESTRICTED PLACES
# =====================================

@auth.route("/active-restricted-places", methods=["GET"])
def get_active_restricted_places():

    conn = get_db_connection()

    try:
        places = conn.execute("""
            SELECT id, place_name, latitude, longitude,
                   radius, reason
            FROM restricted_places
            WHERE is_active = 1
        """).fetchall()

        return jsonify({
            "places": [dict(place) for place in places]
        }), 200

    finally:
        conn.close()
