import pytest
from rest_framework.test import APIClient

from notes.models import Category, Note
from users.models import CustomUser


@pytest.mark.django_db
def test_notes_viewset_auth_and_crud():
    client = APIClient()

    # 1. Unauthenticated request returns 401
    res = client.get("/api/notes/")
    assert res.status_code == 401

    # 2. Authenticated user CRUD
    user = CustomUser.objects.create_user(
        email="notetaker@example.com", username="notetaker", password="password"
    )
    client.force_authenticate(user=user)

    cat = Category.objects.filter(user=user).first()

    # Create Note
    create_res = client.post(
        "/api/notes/",
        {
            "title": "Shopping List",
            "content": "Milk, Eggs, Bread",
            "category_id": str(cat.id),
        },
        format="json",
    )
    assert create_res.status_code == 201
    note_id = create_res.data["id"]

    # List Notes
    list_res = client.get("/api/notes/")
    assert list_res.status_code == 200
    assert len(list_res.data) == 1
    assert list_res.data[0]["title"] == "Shopping List"

    # Update Note
    update_res = client.patch(
        f"/api/notes/{note_id}/", {"title": "Updated Shopping List"}, format="json"
    )
    assert update_res.status_code == 200
    assert update_res.data["title"] == "Updated Shopping List"

    # Delete Note
    delete_res = client.delete(f"/api/notes/{note_id}/")
    assert delete_res.status_code == 204


@pytest.mark.django_db
def test_notes_viewset_tenant_isolation():
    user1 = CustomUser.objects.create_user(
        email="u1@example.com", username="u1", password="pwd"
    )
    user2 = CustomUser.objects.create_user(
        email="u2@example.com", username="u2", password="pwd"
    )

    note_user2 = Note.objects.create(
        user=user2, title="Secret Note", content="Only for user 2"
    )

    client = APIClient()
    client.force_authenticate(user=user1)

    # User 1 cannot retrieve User 2's note
    res = client.get(f"/api/notes/{note_user2.id}/")
    assert res.status_code == 404

    # User 1 listing does not include User 2's note
    list_res = client.get("/api/notes/")
    assert list_res.status_code == 200
    assert len(list_res.data) == 0


@pytest.mark.django_db
def test_category_viewset_crud():
    client = APIClient()

    # 1. Unauthenticated request returns 401
    res = client.get("/api/categories/")
    assert res.status_code == 401

    # 2. Authenticated user
    user = CustomUser.objects.create_user(
        email="catuser@example.com", username="catuser", password="password"
    )
    client.force_authenticate(user=user)

    # Initial categories created by signal
    initial_res = client.get("/api/categories/")
    assert initial_res.status_code == 200
    initial_count = len(initial_res.data)

    # Create new Category
    create_res = client.post(
        "/api/categories/",
        {"name": "Custom Category", "color_hex": "#ABCDEF"},
        format="json",
    )
    assert create_res.status_code == 201
    assert create_res.data["name"] == "Custom Category"
    assert create_res.data["color_hex"] == "#ABCDEF"

    # List categories
    list_res = client.get("/api/categories/")
    assert list_res.status_code == 200
    assert len(list_res.data) == initial_count + 1


@pytest.mark.django_db
def test_notes_viewset_category_filtering():
    user = CustomUser.objects.create_user(
        email="filteruser@example.com", username="filteruser", password="password"
    )
    client = APIClient()
    client.force_authenticate(user=user)

    categories = list(Category.objects.filter(user=user))
    cat1, cat2 = categories[0], categories[1]

    # Create notes in different categories
    Note.objects.create(user=user, category=cat1, title="Note in Cat1", content="...")
    Note.objects.create(user=user, category=cat2, title="Note in Cat2", content="...")

    # Filter by cat1
    res_cat1 = client.get(f"/api/notes/?category_id={cat1.id}")
    assert res_cat1.status_code == 200
    assert len(res_cat1.data) == 1
    assert res_cat1.data[0]["title"] == "Note in Cat1"

    # Filter by cat2
    res_cat2 = client.get(f"/api/notes/?category_id={cat2.id}")
    assert res_cat2.status_code == 200
    assert len(res_cat2.data) == 1
    assert res_cat2.data[0]["title"] == "Note in Cat2"
