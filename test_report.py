import requests

url = "http://127.0.0.1:5000"

session = requests.Session()

# User credentials
email = input("Enter Test User Email: ")
password = input("Enter Test User Password: ")

# STEP 1: Register test user
register_data = {
    "name": "Test User",
    "email": email,
    "password": password
}

register_response = session.post(
    url + "/register",
    json=register_data
)

print("Registration:", register_response.json())


# STEP 2: Login test user
login_data = {
    "email": email,
    "password": password
}

login_response = session.post(
    url + "/login",
    json=login_data
)

print("Login:", login_response.json())


# STEP 3: Submit safety report
if login_response.status_code == 200:

    report_data = {
        "location": "Gomti Nagar, Lucknow",
        "latitude": 26.8505,
        "longitude": 80.9993,
        "report_type": "caution",
        "description": "Sample test report for safety awareness."
    }

    response = session.post(
        url + "/submit-report",
        json=report_data
    )

    print("Report Status:", response.status_code)
    print("Response:", response.json())

else:
    print("Login failed. Report not submitted.")