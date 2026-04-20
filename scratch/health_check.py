import requests

def test_local_api():
    base_url = "http://127.0.0.1:8000/api"
    
    print(f"Testing local API at: {base_url}")
    
    # Root
    try:
        r = requests.get(base_url)
        print(f"Root: {r.status_code} - {r.json()}")
    except Exception as e:
        print(f"Root failed: {e}")

    # Clients
    try:
        r = requests.get(f"{base_url}/clients/british-english-academy")
        print(f"Get Client: {r.status_code} - {r.json().get('name')}")
    except Exception as e:
        print(f"Get Client failed: {e}")

    # Generate Reviews (Expect 500 or 400 depending on how server handles the credit error)
    try:
        r = requests.post(f"{base_url}/generate-reviews", json={"client_slug": "british-english-academy", "count": 1})
        print(f"Generate Reviews: {r.status_code} - {r.json().get('detail')}")
    except Exception as e:
        print(f"Generate Reviews failed: {e}")

if __name__ == "__main__":
    test_local_api()
