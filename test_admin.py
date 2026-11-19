
import requests

url = "http://127.0.0.1:5000"

session = requests.Session()

email = input("Enter Admin Email: ")
password = input("Enter Admin Password: ")

response = session.post(
    url + "/admin-login",
    json={
        "email": email,
        "password": password
    }
)

print("Status:", response.status_code)
print("Response:", response.json())

if response.status_code == 200:
    print("Admin Login Test Successful!")
else:
    print("Admin Login Failed!")
