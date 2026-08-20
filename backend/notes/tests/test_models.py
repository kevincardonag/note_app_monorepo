import time

import pytest

from notes.models import Category, Note
from users.models import CustomUser


@pytest.mark.django_db
def test_category_and_note_str_and_timestamps():
    user = CustomUser.objects.create_user(
        email="author@example.com", username="author", password="password123"
    )

    category = Category.objects.filter(user=user).first()
    assert str(category) == f"{category.name} ({user.email})"

    note = Note.objects.create(
        user=user,
        category=category,
        title="My First Note",
        content="Testing note content.",
    )

    assert str(note) == "My First Note"
    initial_updated_at = note.updated_at

    time.sleep(0.01)
    note.title = "Updated Note Title"
    note.save()
    note.refresh_from_db()

    assert note.updated_at > initial_updated_at
