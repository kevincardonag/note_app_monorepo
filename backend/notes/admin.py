from django.contrib import admin

from .models import Category, Note


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "color_hex", "user", "created_at")
    list_filter = ("user",)
    search_fields = ("name",)


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "user", "updated_at", "created_at")
    list_filter = ("user", "category")
    search_fields = ("title", "content")
    readonly_fields = ("created_at", "updated_at")
