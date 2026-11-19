# Safe Tour Navigation

A web-based tourist safety awareness application developed using Python, Flask, HTML, CSS, JavaScript, and SQLite.

## Project Overview

Safe Tour Navigation helps tourists access safety-related information about places and report potentially unsafe locations. It provides a platform for users to submit safety reports and administrators to review them.

## Features

- User Registration and Login
- User Dashboard
- Safety Report Submission
- Admin Login and Dashboard
- Admin Review of Safety Reports
- Verified Safety Reports
- Map Integration using Leaflet and OpenStreetMap
- Restricted Area Management
- Live Location Monitoring
- Restricted Area Alerts

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Python, Flask
- **Database:** SQLite
- **Map:** Leaflet and OpenStreetMap
- **Deployment:** Gunicorn and Render

## Project Structure

```text
Safe_Tour_Navigation/
│
├── backend/
│   ├── app.py
│   ├── database.py
│   ├── routes.py
│   └── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── admin.html
│   ├── route.html
│   └── static/
│
├── ai_model/
├── create_admin.py
├── test_admin.py
├── test_report.py
├── requirements.txt
├── README.md
└── .gitignore
```

## Installation and Setup

1. Clone the repository.
2. Create and activate a Python virtual environment.
3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Run the application:

```bash
python backend/app.py
```

5. Open in your browser:

```text
http://127.0.0.1:5000
```

## Important Note

This project currently provides safety reporting, administrator verification, restricted area management, and location-based alerts. AI-based safety prediction and automatic safe-route calculation are not yet implemented.

## Future Scope

- AI-based safety prediction
- Safe route recommendation
- More tourist destinations
- Improved real-time safety information
- Cloud database integration

## Academic Project

Developed as a B.Tech Computer Science and Engineering (Artificial Intelligence) mini project.