#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid
import os
import urllib3

# Disable SSL warnings for testing
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class VelvetRoomAPITester:
    def __init__(self, base_url="https://encounter-hub-2.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.admin_token = None
        self.user_id = None
        self.admin_id = None
        self.test_listing_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
            self.failed_tests.append({"test": name, "error": details})

    def make_request(self, method, endpoint, data=None, files=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            default_headers.update(headers)
        
        # Remove Content-Type for file uploads
        if files:
            default_headers.pop('Content-Type', None)

        try:
            print(f"Making {method} request to {url}")
            if method == 'GET':
                response = requests.get(url, headers=default_headers, verify=False, timeout=30)
            elif method == 'POST':
                if files or data:
                    # For form data, don't use json parameter
                    print(f"Sending form data: {data}")
                    response = requests.post(url, data=data, files=files, headers=default_headers, verify=False, timeout=30)
                else:
                    print(f"Sending JSON data: {data}")
                    response = requests.post(url, json=data, headers=default_headers, verify=False, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, verify=False, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=default_headers, verify=False, timeout=30)
            
            print(f"Response status: {response.status_code}")
            return response
        except Exception as e:
            print(f"Request failed: {str(e)}")
            return None

    def test_stats_endpoint(self):
        """Test stats endpoint (no auth required)"""
        response = self.make_request('GET', 'stats')
        if response and response.status_code == 200:
            data = response.json()
            success = 'total_listings' in data and 'total_users' in data
            self.log_test("Stats Endpoint", success, "" if success else "Missing required fields")
            return success
        else:
            self.log_test("Stats Endpoint", False, f"Status: {response.status_code if response else 'No response'}")
            return False

    def test_user_registration(self):
        """Test user registration"""
        test_email = f"testuser_{uuid.uuid4().hex[:8]}@test.com"
        user_data = {
            "email": test_email,
            "password": "testpass123",
            "name": "Test User"
        }
        
        response = self.make_request('POST', 'auth/register', user_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'token' in data and 'user' in data:
                self.token = data['token']
                self.user_id = data['user']['id']
                self.log_test("User Registration", True)
                return True
        
        error_msg = f"Status: {response.status_code if response else 'No response'}"
        if response and response.status_code != 200:
            try:
                error_detail = response.json()
                error_msg += f", Detail: {error_detail}"
            except:
                error_msg += f", Text: {response.text}"
        self.log_test("User Registration", False, error_msg)
        return False

    def test_admin_login(self):
        """Test admin login"""
        admin_data = {
            "email": "admin@velvetroom.com",
            "password": "admin123"
        }
        
        response = self.make_request('POST', 'auth/login', admin_data)
        if response and response.status_code == 200:
            data = response.json()
            if 'token' in data and 'user' in data and data['user']['role'] == 'admin':
                self.admin_token = data['token']
                self.admin_id = data['user']['id']
                self.log_test("Admin Login", True)
                return True
        
        error_msg = f"Status: {response.status_code if response else 'No response'}"
        if response and response.status_code != 200:
            try:
                error_detail = response.json()
                error_msg += f", Detail: {error_detail}"
            except:
                error_msg += f", Text: {response.text}"
        self.log_test("Admin Login", False, error_msg)
        return False

    def test_get_current_user(self):
        """Test get current user endpoint"""
        response = self.make_request('GET', 'auth/me')
        if response and response.status_code == 200:
            data = response.json()
            success = 'id' in data and 'email' in data and 'name' in data
            self.log_test("Get Current User", success)
            return success
        
        self.log_test("Get Current User", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_create_listing(self):
        """Test creating a listing"""
        listing_data = {
            "title": "Test Listing",
            "description": "This is a test listing for automated testing",
            "price": "150.0",
            "location": "Test City, TS",
            "category": "Escorts",
            "phone": "+1234567890",
            "email": "test@example.com",
            "images": "https://images.unsplash.com/photo-1759771716328-db403c219f56?crop=entropy&cs=srgb&fm=jpg&q=85"
        }
        
        # Use form data instead of JSON
        response = self.make_request('POST', 'listings', data=listing_data, files=None)
        if response and response.status_code == 200:
            data = response.json()
            if 'id' in data and data['status'] == 'pending':
                self.test_listing_id = data['id']
                self.log_test("Create Listing", True)
                return True
        
        self.log_test("Create Listing", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_listings(self):
        """Test getting listings (public endpoint)"""
        # Test without auth (should work for approved listings)
        old_token = self.token
        self.token = None
        
        response = self.make_request('GET', 'listings?status=approved')
        if response and response.status_code == 200:
            data = response.json()
            success = isinstance(data, list)
            self.log_test("Get Approved Listings (Public)", success)
        else:
            self.log_test("Get Approved Listings (Public)", False, f"Status: {response.status_code if response else 'No response'}")
        
        self.token = old_token
        return True

    def test_get_my_listings(self):
        """Test getting user's own listings"""
        response = self.make_request('GET', 'listings/user/me')
        if response and response.status_code == 200:
            data = response.json()
            success = isinstance(data, list)
            self.log_test("Get My Listings", success)
            return success
        
        self.log_test("Get My Listings", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_admin_get_pending_listings(self):
        """Test admin getting pending listings"""
        old_token = self.token
        self.token = self.admin_token
        
        response = self.make_request('GET', 'admin/listings?status=pending')
        if response and response.status_code == 200:
            data = response.json()
            success = isinstance(data, list)
            self.log_test("Admin Get Pending Listings", success)
        else:
            self.log_test("Admin Get Pending Listings", False, f"Status: {response.status_code if response else 'No response'}")
        
        self.token = old_token
        return True

    def test_admin_approve_listing(self):
        """Test admin approving a listing"""
        if not self.test_listing_id:
            self.log_test("Admin Approve Listing", False, "No test listing ID available")
            return False
        
        old_token = self.token
        self.token = self.admin_token
        
        response = self.make_request('POST', f'admin/listings/{self.test_listing_id}/status', {"status": "approved"})
        if response and response.status_code == 200:
            self.log_test("Admin Approve Listing", True)
            success = True
        else:
            self.log_test("Admin Approve Listing", False, f"Status: {response.status_code if response else 'No response'}")
            success = False
        
        self.token = old_token
        return success

    def test_get_listing_detail(self):
        """Test getting listing detail (should increment views)"""
        if not self.test_listing_id:
            self.log_test("Get Listing Detail", False, "No test listing ID available")
            return False
        
        response = self.make_request('GET', f'listings/{self.test_listing_id}')
        if response and response.status_code == 200:
            data = response.json()
            success = 'id' in data and 'views' in data
            self.log_test("Get Listing Detail", success)
            return success
        
        self.log_test("Get Listing Detail", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_add_favorite(self):
        """Test adding listing to favorites"""
        if not self.test_listing_id:
            self.log_test("Add Favorite", False, "No test listing ID available")
            return False
        
        # Use form data as expected by the API
        favorite_data = {"listing_id": self.test_listing_id}
        response = self.make_request('POST', 'favorites', data=favorite_data)
        if response and response.status_code == 200:
            self.log_test("Add Favorite", True)
            return True
        
        self.log_test("Add Favorite", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_favorites(self):
        """Test getting user's favorites"""
        response = self.make_request('GET', 'favorites')
        if response and response.status_code == 200:
            data = response.json()
            success = isinstance(data, list)
            self.log_test("Get Favorites", success)
            return success
        
        self.log_test("Get Favorites", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_send_message(self):
        """Test sending a message"""
        if not self.test_listing_id or not self.admin_id:
            self.log_test("Send Message", False, "Missing test listing ID or admin ID")
            return False
        
        message_data = {
            "to_user_id": self.admin_id,
            "listing_id": self.test_listing_id,
            "content": "Test message from automated testing"
        }
        
        response = self.make_request('POST', 'messages', message_data)
        if response and response.status_code == 200:
            data = response.json()
            success = 'id' in data and 'content' in data
            self.log_test("Send Message", success)
            return success
        
        self.log_test("Send Message", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_get_messages(self):
        """Test getting user's messages"""
        response = self.make_request('GET', 'messages')
        if response and response.status_code == 200:
            data = response.json()
            success = isinstance(data, list)
            self.log_test("Get Messages", success)
            return success
        
        self.log_test("Get Messages", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def test_delete_listing(self):
        """Test deleting a listing"""
        if not self.test_listing_id:
            self.log_test("Delete Listing", False, "No test listing ID available")
            return False
        
        response = self.make_request('DELETE', f'listings/{self.test_listing_id}')
        if response and response.status_code == 200:
            self.log_test("Delete Listing", True)
            return True
        
        self.log_test("Delete Listing", False, f"Status: {response.status_code if response else 'No response'}")
        return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting VelvetRoom API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic endpoints first
        self.test_stats_endpoint()
        
        # Test user authentication
        if self.test_user_registration():
            self.test_get_current_user()
        
        # Test admin login
        self.test_admin_login()
        
        # Test listing operations
        if self.test_create_listing():
            self.test_get_my_listings()
            self.test_admin_get_pending_listings()
            
            if self.test_admin_approve_listing():
                self.test_get_listing_detail()
                self.test_get_listings()
            
            # Test favorites and messages
            self.test_add_favorite()
            self.test_get_favorites()
            self.test_send_message()
            self.test_get_messages()
            
            # Clean up
            self.test_delete_listing()
        
        # Print summary
        print("=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['error']}")
        
        return self.tests_passed, self.tests_run, self.failed_tests

def main():
    tester = VelvetRoomAPITester()
    passed, total, failed = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())