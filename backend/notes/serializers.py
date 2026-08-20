import re
from rest_framework import serializers
from .models import Category, Note

COLOR_HEX_REGEX = re.compile(r"^#[0-9A-Fa-f]{6}$")


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "color_hex", "created_at")
        read_only_fields = ("id", "created_at")

    def validate_color_hex(self, value):
        if not COLOR_HEX_REGEX.match(value):
            raise serializers.ValidationError(
                "color_hex must be a valid hex color (e.g. #FF6B6B)."
            )
        return value


class NoteSerializer(serializers.ModelSerializer):
    title = serializers.CharField(allow_blank=True, required=False, default="")
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Note
        fields = (
            "id",
            "title",
            "content",
            "category",
            "category_id",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_category_id(self, value):
        if value is not None:
            request = self.context.get("request")
            if request and request.user.is_authenticated and value.user != request.user:
                raise serializers.ValidationError(
                    "You cannot assign a category that does not belong to you."
                )
        return value
