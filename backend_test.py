import requests
import sys
import json
from datetime import datetime

class ReviewGenAPITester:
    def __init__(self, base_url="https://auto-review-drop.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            result = {
                "test": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    result["response_data"] = response_data
                    return success, response_data
                except:
                    result["response_data"] = response.text
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                result["error"] = response.text[:200]
                
            self.test_results.append(result)
            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result["success"] = False
            result["error"] = str(e)
            self.test_results.append(result)
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        success, response = self.run_test(
            "API Root Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_seed_clients(self):
        """Test seeding clients data"""
        success, response = self.run_test(
            "Seed Clients Data",
            "POST", 
            "seed-clients",
            200
        )
        return success, response

    def test_get_all_clients(self):
        """Test getting all clients"""
        success, response = self.run_test(
            "Get All Clients",
            "GET",
            "clients", 
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} clients")
            for client in response:
                print(f"   - {client.get('name', 'Unknown')} ({client.get('slug', 'no-slug')})")
        
        return success, response

    def test_get_client_by_slug(self, slug):
        """Test getting specific client by slug"""
        success, response = self.run_test(
            f"Get Client by Slug: {slug}",
            "GET",
            f"clients/{slug}",
            200
        )
        
        if success:
            print(f"   Client: {response.get('name', 'Unknown')}")
            print(f"   Brand Color: {response.get('brand_color', 'Unknown')}")
            print(f"   GMB Link: {response.get('gmb_link', 'Unknown')}")
        
        return success, response

    def test_generate_reviews(self, client_slug, count=3):
        """Test generating reviews for a client"""
        success, response = self.run_test(
            f"Generate Reviews for {client_slug}",
            "POST",
            "generate-reviews",
            200,
            data={"client_slug": client_slug, "count": count}
        )
        
        if success and isinstance(response, dict) and 'reviews' in response:
            reviews = response['reviews']
            print(f"   Generated {len(reviews)} reviews")
            for i, review in enumerate(reviews[:2]):  # Show first 2 reviews
                print(f"   Review {i+1}: {review[:100]}...")
        
        return success, response

    def test_create_status_check(self):
        """Test creating a status check"""
        success, response = self.run_test(
            "Create Status Check",
            "POST",
            "status",
            200,
            data={"client_name": "Test Client"}
        )
        return success, response

    def test_get_status_checks(self):
        """Test getting status checks"""
        success, response = self.run_test(
            "Get Status Checks",
            "GET",
            "status",
            200
        )
        return success, response

def main():
    print("🚀 Starting ReviewGen API Tests")
    print(f"Testing against: https://auto-review-drop.preview.emergentagent.com/api")
    print("="*50)
    
    tester = ReviewGenAPITester()
    
    # Test API root
    tester.test_root_endpoint()
    
    # Seed clients first
    print("\n📥 Seeding initial data...")
    seed_success, seed_data = tester.test_seed_clients()
    
    # Get all clients
    print("\n👥 Testing client endpoints...")
    clients_success, clients_data = tester.test_get_all_clients()
    
    # Test individual clients if we have them
    if clients_success and clients_data:
        expected_clients = ["british-english-academy", "uniconnect-immigration"]
        
        for slug in expected_clients:
            client_success, client_data = tester.test_get_client_by_slug(slug)
            
            # Test review generation for each client
            if client_success:
                print(f"\n🤖 Testing AI review generation for {slug}...")
                review_success, review_data = tester.test_generate_reviews(slug, count=3)
                
                # Test with different counts
                if review_success:
                    tester.test_generate_reviews(slug, count=1)
                    tester.test_generate_reviews(slug, count=10)  # Max allowed
    
    # Test status endpoints
    print("\n📊 Testing status endpoints...")
    tester.test_create_status_check()
    tester.test_get_status_checks()
    
    # Test edge cases
    print("\n🧪 Testing edge cases...")
    tester.run_test("Non-existent Client", "GET", "clients/non-existent", 404)
    tester.run_test("Invalid Review Request", "POST", "generate-reviews", 404, 
                   data={"client_slug": "invalid-slug", "count": 5})
    
    # Print final results
    print("\n" + "="*50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())