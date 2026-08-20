import pytest
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_signup_and_jwt_auth_flow():
    client = APIClient()

    # 1. Sign Up
    signup_res = client.post(
        "/api/auth/signup/",
        {
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "Password123!",
        },
        format="json",
    )
    assert signup_res.status_code == 201
    assert signup_res.data["email"] == "newuser@example.com"
    assert "password" not in signup_res.data

    # 2. Duplicate email should fail
    duplicate_res = client.post(
        "/api/auth/signup/",
        {"email": "newuser@example.com", "password": "Password123!"},
        format="json",
    )
    assert duplicate_res.status_code == 400

    # 3. Obtain JWT token
    token_res = client.post(
        "/api/auth/token/",
        {"email": "newuser@example.com", "password": "Password123!"},
        format="json",
    )
    assert token_res.status_code == 200
    assert "access" in token_res.data
    assert "refresh" in token_res.data

    # 4. Access protected profile using token
    access_token = token_res.data["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
    me_res = client.get("/api/auth/me/")
    assert me_res.status_code == 200
    assert me_res.data["email"] == "newuser@example.com"

    # 5. Invalid credentials return 401
    bad_token_res = client.post(
        "/api/auth/token/",
        {"email": "newuser@example.com", "password": "WrongPassword"},
        format="json",
    )
    assert bad_token_res.status_code == 401
