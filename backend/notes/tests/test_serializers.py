import pytest
from rest_framework.test import APIRequestFactory
from users.models import CustomUser
from notes.models import Category
from notes.serializers import CategorySerializer, NoteSerializer


@pytest.mark.django_db
def test_category_serializer():
    user = CustomUser.objects.create_user(
        email="user@example.com", username="user", password="pwd"
    )
    cat = Category.objects.create(user=user, name="Work", color_hex="#123456")

    serializer = CategorySerializer(instance=cat)
    data = serializer.data

    assert set(data.keys()) == {"id", "name", "color_hex", "created_at"}
    assert data["name"] == "Work"
    assert data["color_hex"] == "#123456"

    # Test invalid color_hex formats
    invalid_serializer = CategorySerializer(
        data={"name": "Invalid", "color_hex": "not-a-hex"}
    )
    assert not invalid_serializer.is_valid()
    assert "color_hex" in invalid_serializer.errors

    invalid_short = CategorySerializer(data={"name": "Invalid", "color_hex": "#FFF"})
    assert not invalid_short.is_valid()
    assert "color_hex" in invalid_short.errors


@pytest.mark.django_db
def test_note_serializer_tenant_validation():
    user1 = CustomUser.objects.create_user(
        email="user1@example.com", username="u1", password="pwd"
    )
    user2 = CustomUser.objects.create_user(
        email="user2@example.com", username="u2", password="pwd"
    )

    cat_user2 = Category.objects.create(
        user=user2, name="User2 Category", color_hex="#654321"
    )

    factory = APIRequestFactory()
    request = factory.post("/api/notes/")
    request.user = user1

    # Attempting to assign user2's category to user1's note
    serializer = NoteSerializer(
        data={"title": "Test", "content": "Content", "category_id": str(cat_user2.id)},
        context={"request": request},
    )

    assert not serializer.is_valid()
    assert "category_id" in serializer.errors
