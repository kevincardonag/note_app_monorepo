from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Category

DEFAULT_CATEGORIES = [
    {"name": "Random Thoughts", "color_hex": "#EF9C66"},
    {"name": "School", "color_hex": "#FCDC94"},
    {"name": "Personal", "color_hex": "#78ABA8"},
]


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_default_categories(sender, instance, created, **kwargs):
    """
    Automatically create default categories for new users upon registration.
    """
    if created:
        categories_to_create = [
            Category(user=instance, name=cat["name"], color_hex=cat["color_hex"])
            for cat in DEFAULT_CATEGORIES
        ]
        Category.objects.bulk_create(categories_to_create)
