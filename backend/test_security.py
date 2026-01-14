import requests

API_URL = "http://localhost:8000"

def test_security():
    print("Testing Security...")
    # Try to list orgs without auth
    try:
        res = requests.get(f"{API_URL}/organizations")
        print(f"GET /organizations status: {res.status_code}")
        if res.status_code == 401 or res.status_code == 403:
            print("SUCCESS: Endpoint is secured.")
        else:
            print(f"FAIL: Endpoint returned {res.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_security()
