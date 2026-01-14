import requests
import uuid

API_URL = "http://localhost:8000"

def test_flow():
    # 1. Create Org
    org_name = f"Test Org {uuid.uuid4().hex[:8]}"
    print(f"Creating Org: {org_name}")
    res = requests.post(f"{API_URL}/organizations", json={"name": org_name})
    if res.status_code != 200:
        print("FAILED to create org:", res.text)
        return
    org = res.json()
    print("Org Created:", org)
    
    # 2. Create Project
    print("Creating Project...")
    payload = {
        "org_id": org['id'],
        "name": "Integration Test Project",
        "template_id": "recruitment-ai-v1"
    }
    res = requests.post(f"{API_URL}/projects", json=payload)
    if res.status_code != 200:
        print("FAILED to create project:", res.text)
        return
    project = res.json()
    print("Project Created:", project)

if __name__ == "__main__":
    try:
        test_flow()
    except Exception as e:
        print("Test failed with exception:", e)
