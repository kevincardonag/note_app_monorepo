import pytest
from users.models import CustomUser
from notes.models import Category


@pytest.mark.django_db
def test_create_default_categories_on_user_creation():
    user = CustomUser.objects.create_user(
        email="testuser@example.com", username="testuser", password="securepassword123"
    )

    categories = Category.objects.filter(user=user)
    assert categories.count() == 3

    names = list(categories.values_list("name", flat=True))
    assert "Random Thoughts" in names
    assert "School" in names
    assert "Personal" in names

    for cat in categories:
        assert cat.color_hex.startswith("#")
