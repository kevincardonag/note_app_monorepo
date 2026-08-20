from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from notes.models import Category, Note

User = get_user_model()

DEFAULT_CATEGORIES = [
    {"name": "Random Thoughts", "color_hex": "#EF9C66"},
    {"name": "School", "color_hex": "#FCDC94"},
    {"name": "Personal", "color_hex": "#78ABA8"},
]

SEED_DATA = {
    "Random Thoughts": [
        {
            "title": "Midnight Epiphanies",
            "content": "What if clouds are just the sky's way of daydreaming in watercolor? The quiet hours after midnight always bring the most vivid reflections.",
            "days_ago": 0,  # Today
        },
        {
            "title": "Coffee Philosophy",
            "content": "There are two types of mornings: the ones before the first espresso, and the ones that actually happen. Life begins after caffeine.",
            "days_ago": 1,  # Yesterday
        },
        {
            "title": "Book Ideas & Stargazing",
            "content": "A story about an antique clock shop where each clock ticks in a different rhythm of the universe. Time isn't linear—it dances.",
            "days_ago": 4,  # Previous
        },
    ],
    "School": [
        {
            "title": "Algorithms & Data Structures Review",
            "content": "Chapter 4: Binary search trees, balanced AVL trees, and time complexity tradeoffs for graph traversal algorithms (BFS vs DFS).",
            "days_ago": 0,  # Today
        },
        {
            "title": "Modern Art History Essay Outline",
            "content": "Introduction to the Bauhaus movement: form follows function, primary color palettes, and revolutionary typography by Herbert Bayer.",
            "days_ago": 1,  # Yesterday
        },
        {
            "title": "Calculus Problem Set #3",
            "content": "Complete exercises 14 through 28 on integration by parts and trigonometric substitution before Friday's lab session.",
            "days_ago": 5,  # Previous
        },
    ],
    "Personal": [
        {
            "title": "Weekly Routine & Mindful Goals",
            "content": "1. Drink 2 liters of water daily.\n2. Read 20 pages of fiction before sleep.\n3. Take a 30-minute evening walk without screens or headphones.\n4. Call family on Sunday.",
            "days_ago": 0,  # Today
        },
    ],
}


class Command(BaseCommand):
    help = (
        "Seeds 3 Random Thoughts notes, 3 School notes, and 1 Personal note for a user"
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            type=str,
            help="Email of the user to seed notes for. Defaults to the first user found or creates a demo user.",
        )

    def handle(self, *args, **options):
        email = options.get("email")

        if email:
            user = User.objects.filter(email=email).first()
            if not user:
                self.stdout.write(
                    self.style.WARNING(f"User {email} not found. Creating user...")
                )
                user = User.objects.create_user(
                    username=email, email=email, password="password123"
                )
        else:
            user = User.objects.first()
            if not user:
                self.stdout.write(
                    self.style.WARNING(
                        "No users found in database. Creating demo user 'demo@example.com'..."
                    )
                )
                user = User.objects.create_user(
                    username="demo", email="demo@example.com", password="password123"
                )

        self.stdout.write(self.style.SUCCESS(f"Seeding notes for user: {user.email}"))

        # Ensure default categories exist
        category_map = {}
        for cat_data in DEFAULT_CATEGORIES:
            category, _ = Category.objects.get_or_create(
                user=user,
                name=cat_data["name"],
                defaults={"color_hex": cat_data["color_hex"]},
            )
            # Update color if needed
            if category.color_hex != cat_data["color_hex"]:
                category.color_hex = cat_data["color_hex"]
                category.save()
            category_map[cat_data["name"]] = category

        now = timezone.now()
        total_created = 0

        for cat_name, notes_list in SEED_DATA.items():
            category = category_map[cat_name]
            for item in notes_list:
                note_date = now - timedelta(days=item["days_ago"], hours=2)
                note = Note.objects.create(
                    user=user,
                    category=category,
                    title=item["title"],
                    content=item["content"],
                )
                # Overwrite timestamps so date groupings (today, yesterday, previous) take effect
                Note.objects.filter(id=note.id).update(
                    created_at=note_date, updated_at=note_date
                )
                total_created += 1
                self.stdout.write(
                    f"  + [{cat_name}] {item['title']} (created: {note_date.strftime('%Y-%m-%d')})"
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully seeded {total_created} notes (3 Random Thoughts, 3 School, 1 Personal) for {user.email}!"
            )
        )
