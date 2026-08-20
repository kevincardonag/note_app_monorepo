import pytest

from users.models import CustomUser


@pytest.mark.django_db
def test_custom_user_str_method():
    user = CustomUser.objects.create_user(
        email="testuser@example.com", username="testuser", password="password123"
    )
    assert str(user) == "testuser@example.com"
