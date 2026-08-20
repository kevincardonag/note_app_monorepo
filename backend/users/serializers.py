from rest_framework import serializers
from .models import CustomUser


class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )

    class Meta:
        model = CustomUser
        fields = ("id", "email", "username", "password")
        read_only_fields = ("id",)

    def create(self, validated_data):
        username = validated_data.get("username") or validated_data["email"]
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            username=username,
            password=validated_data["password"],
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "email", "username")
        read_only_fields = ("id", "email", "username")
