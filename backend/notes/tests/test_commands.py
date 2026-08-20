import pytest
from io import StringIO
from django.core.management import call_command
from users.models import CustomUser
from notes.models import Note, Category


@pytest.mark.django_db
def test_seed_notes_command():
    out = StringIO()

    # 1. First execution creates demo user and seeds notes
    call_command("seed_notes", stdout=out)
    output = out.getvalue()
    assert "Successfully seeded 7 notes" in output

    user = CustomUser.objects.get(email="demo@example.com")
    assert Note.objects.filter(user=user).count() == 7
    assert Category.objects.filter(user=user).count() >= 3

    # Change category color to test color update branch (lines 95-96)
    cat = Category.objects.filter(user=user, name="Random Thoughts").first()
    cat.color_hex = "#000000"
    cat.save()

    # 2. Second execution with existing user seeds another 7 notes and updates category color
    out2 = StringIO()
    call_command("seed_notes", stdout=out2)
    output2 = out2.getvalue()
    assert "Seeding notes for user: demo@example.com" in output2
    assert "Successfully seeded 7 notes" in output2
    assert Note.objects.filter(user=user).count() == 14

    # 3. Test with explicit email for new user
    out3 = StringIO()
    call_command("seed_notes", email="custom@example.com", stdout=out3)
    output3 = out3.getvalue()
    assert "User custom@example.com not found. Creating user" in output3
    custom_user = CustomUser.objects.get(email="custom@example.com")
    assert Note.objects.filter(user=custom_user).count() == 7

    # 4. Test with explicit email for existing user
    out4 = StringIO()
    call_command("seed_notes", email="custom@example.com", stdout=out4)
    output4 = out4.getvalue()
    assert "Seeding notes for user: custom@example.com" in output4
    assert Note.objects.filter(user=custom_user).count() == 14
