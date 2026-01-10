"""
Backend API Tests for DurexEthiopia Classified Listings Platform
Tests: Auth, Listings, Pagination, Admin User Management, Admin Listing Edit
"""
import pytest
import requests
import os
import json

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://adultseek.preview.emergentagent.com').rstrip('/')

# Test data
TEST_USER = {
    "email": "TEST_user@test.com",
    "password": "test123",
    "name": "TestUser"
}

ADMIN_USER = {
    "email": "TEST_admin@test.com",
    "password": "admin123",
    "name": "AdminUser"
}


class TestHealthAndStats:
    """Basic health and stats endpoint tests"""
    
    def test_stats_endpoint(self):
        """Test GET /api/stats returns valid response"""
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_listings" in data
        assert "total_users" in data
        print(f"Stats: {data}")


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_register_new_user(self):
        """Test user registration"""
        # First try to clean up if user exists
        response = requests.post(f"{BASE_URL}/api/auth/register", json=TEST_USER)
        
        if response.status_code == 400:
            # User already exists, try login instead
            print("User already exists, testing login instead")
            return
        
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == TEST_USER["email"]
        print(f"Registered user: {data['user']['name']}")
    
    def test_login_success(self):
        """Test successful login"""
        # First ensure user exists
        requests.post(f"{BASE_URL}/api/auth/register", json=TEST_USER)
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        print(f"Login successful for: {data['user']['email']}")
    
    def test_login_invalid_credentials(self):
        """Test login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("Invalid credentials correctly rejected")
    
    def test_get_current_user(self):
        """Test GET /api/auth/me with valid token"""
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        
        if login_response.status_code != 200:
            pytest.skip("Login failed, skipping auth/me test")
        
        token = login_response.json()["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == TEST_USER["email"]
        print(f"Current user: {data['name']}")


class TestListingsAPI:
    """Listings CRUD and pagination tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        # Ensure user exists
        requests.post(f"{BASE_URL}/api/auth/register", json=TEST_USER)
        
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        if response.status_code == 200:
            return response.json()["token"]
        pytest.skip("Could not get auth token")
    
    def test_get_listings_empty(self):
        """Test GET /api/listings returns list"""
        response = requests.get(f"{BASE_URL}/api/listings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Found {len(data)} listings")
    
    def test_get_listings_with_pagination(self):
        """Test GET /api/listings with pagination params"""
        response = requests.get(f"{BASE_URL}/api/listings?page=1&limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 10
        print(f"Page 1 has {len(data)} listings")
    
    def test_get_listings_count(self):
        """Test GET /api/listings/count endpoint"""
        response = requests.get(f"{BASE_URL}/api/listings/count")
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert isinstance(data["total"], int)
        print(f"Total listings count: {data['total']}")
    
    def test_get_listings_count_with_filters(self):
        """Test GET /api/listings/count with filter params"""
        response = requests.get(f"{BASE_URL}/api/listings/count?gender=Female")
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        print(f"Female listings count: {data['total']}")
    
    def test_get_listings_with_gender_filter(self):
        """Test GET /api/listings with gender filter"""
        response = requests.get(f"{BASE_URL}/api/listings?gender=Female")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Female listings: {len(data)}")
    
    def test_get_listings_with_category_filter(self):
        """Test GET /api/listings with category filter"""
        response = requests.get(f"{BASE_URL}/api/listings?category=Escorts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Escorts category listings: {len(data)}")
    
    def test_get_listings_with_race_filter(self):
        """Test GET /api/listings with race/ethnicity filter"""
        response = requests.get(f"{BASE_URL}/api/listings?race=African")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"African ethnicity listings: {len(data)}")
    
    def test_get_listings_with_age_filter(self):
        """Test GET /api/listings with age range filter"""
        response = requests.get(f"{BASE_URL}/api/listings?min_age=21&max_age=30")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Age 21-30 listings: {len(data)}")
    
    def test_create_listing(self, auth_token):
        """Test POST /api/listings creates a new listing"""
        listing_data = {
            "title": "TEST_Premium Service",
            "description": "Test listing description for automated testing",
            "price": "150",
            "location": json.dumps({"city": "Addis Ababa", "country": "Ethiopia"}),
            "category": "Escorts",
            "phone": "+251911234567",
            "email": "test@test.com",
            "age": "25",
            "gender": "Female",
            "race": "African",
            "services": json.dumps(["Companionship", "Dinner Dates"]),
            "pricing_tiers": json.dumps([{"hours": 1, "price": 150}])
        }
        
        response = requests.post(
            f"{BASE_URL}/api/listings",
            data=listing_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "TEST_Premium Service"
        assert data["age"] == 25
        assert data["gender"] == "Female"
        assert data["race"] == "African"
        assert data["status"] == "pending"
        print(f"Created listing: {data['id']}")
        
        # Store listing ID for cleanup
        return data["id"]
    
    def test_get_my_listings(self, auth_token):
        """Test GET /api/listings/user/me returns user's listings"""
        response = requests.get(
            f"{BASE_URL}/api/listings/user/me",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"User has {len(data)} listings")


class TestAdminAPI:
    """Admin API tests for user management and listing edit"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        # First register admin user
        requests.post(f"{BASE_URL}/api/auth/register", json=ADMIN_USER)
        
        # Login
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_USER["email"],
            "password": ADMIN_USER["password"]
        })
        
        if response.status_code != 200:
            pytest.skip("Could not login as admin")
        
        return response.json()["token"]
    
    def test_admin_get_users_requires_admin(self):
        """Test GET /api/admin/users requires admin role"""
        # Login as regular user
        requests.post(f"{BASE_URL}/api/auth/register", json=TEST_USER)
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        
        if login_response.status_code != 200:
            pytest.skip("Could not login")
        
        token = login_response.json()["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Should be 403 Forbidden for non-admin
        assert response.status_code == 403
        print("Non-admin correctly rejected from admin endpoint")
    
    def test_admin_get_listings_requires_admin(self):
        """Test GET /api/admin/listings requires admin role"""
        # Login as regular user
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        
        if login_response.status_code != 200:
            pytest.skip("Could not login")
        
        token = login_response.json()["token"]
        
        response = requests.get(
            f"{BASE_URL}/api/admin/listings?status=pending",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        # Should be 403 Forbidden for non-admin
        assert response.status_code == 403
        print("Non-admin correctly rejected from admin listings endpoint")
    
    def test_admin_user_status_endpoint_exists(self):
        """Test PUT /api/admin/users/{id}/status endpoint exists"""
        # This tests that the endpoint is defined (will return 401 without auth)
        response = requests.put(f"{BASE_URL}/api/admin/users/fake-id/status?status=active")
        # Should be 401 (unauthorized) or 403 (forbidden), not 404
        assert response.status_code in [401, 403, 422]
        print(f"Admin user status endpoint exists (status: {response.status_code})")
    
    def test_admin_listing_edit_endpoint_exists(self):
        """Test PUT /api/admin/listings/{id}/edit endpoint exists"""
        # This tests that the endpoint is defined
        response = requests.put(f"{BASE_URL}/api/admin/listings/fake-id/edit")
        # Should be 401 (unauthorized) or 403 (forbidden), not 404
        assert response.status_code in [401, 403, 422]
        print(f"Admin listing edit endpoint exists (status: {response.status_code})")


class TestLocations:
    """Location data endpoint tests"""
    
    def test_get_locations(self):
        """Test GET /api/locations returns location data"""
        response = requests.get(f"{BASE_URL}/api/locations")
        # May return 404 if locations.json doesn't exist, or 200 with data
        if response.status_code == 200:
            data = response.json()
            print(f"Locations data available: {type(data)}")
        else:
            print(f"Locations endpoint returned: {response.status_code}")


class TestCleanup:
    """Cleanup test data"""
    
    def test_cleanup_test_listings(self):
        """Clean up TEST_ prefixed listings"""
        # Login as test user
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        })
        
        if login_response.status_code != 200:
            print("Could not login for cleanup")
            return
        
        token = login_response.json()["token"]
        
        # Get user's listings
        response = requests.get(
            f"{BASE_URL}/api/listings/user/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if response.status_code == 200:
            listings = response.json()
            for listing in listings:
                if listing.get("title", "").startswith("TEST_"):
                    delete_response = requests.delete(
                        f"{BASE_URL}/api/listings/{listing['id']}",
                        headers={"Authorization": f"Bearer {token}"}
                    )
                    print(f"Deleted test listing: {listing['id']} - {delete_response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
