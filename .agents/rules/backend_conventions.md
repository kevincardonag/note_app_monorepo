---
name: Backend Conventions
description: Strict guidelines for writing Django and DRF code in this project.
trigger: directory_match
directory: backend/
---

# Backend Architecture Rules

These rules must be strictly adhered to when generating or modifying code in the `backend/` directory.

## 1. Fat Models, Skinny Views
*   Keep Django `Views` and DRF `ViewSets` as thin as possible. Their only responsibility is to parse incoming requests, validate them, and return responses.
*   Push core business logic into the Django `Models` or into a dedicated `services.py` layer.

## 2. Django REST Framework (DRF)
*   **Explicit Serializers**: Always define explicit fields in DRF serializers. Avoid `fields = "__all__"` in production code unless specifically building a rapid prototype.
*   Use standard DRF ViewSets (`ModelViewSet`, `ReadOnlyModelViewSet`) to maintain consistent RESTful endpoints.

## 3. Documentation and Schemas
*   Ensure every endpoint is properly documented using `drf-spectacular` annotations (like `@extend_schema`) if its behavior deviates from standard CRUD.
*   The OpenAPI schema is the source of truth for the frontend. Any change to a serializer or view that affects the API contract must trigger a regeneration of the schema.

## 4. Environment and Secrets
*   Never hardcode secrets. Always use `django-environ` to read from the `.env` file.
