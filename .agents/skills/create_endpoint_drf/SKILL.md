---
name: crear_endpoint_drf
description: Standard workflow to scaffold a new API endpoint in Django REST Framework and sync it with the Next.js frontend via OpenAPI.
---

# Creating a DRF Endpoint Workflow

When requested to create a new endpoint or feature in the backend, follow these steps strictly to ensure architectural consistency.

## 1. Model Definition
*   Define the data structure in `models.py`.
*   Ensure necessary relationships (ForeignKeys) and metadata (like `auto_now_add`) are included.

## 2. Migrations
*   Run the command to generate the migration file inside the Docker container:
    ```bash
    docker compose -f docker-compose.local.yml run --rm django python manage.py makemigrations
    ```
*   Apply the migration to the local database:
    ```bash
    docker compose -f docker-compose.local.yml run --rm django python manage.py migrate
    ```

## 3. Serializer Creation
*   Create or update the serializer in `serializers.py`.
*   Make sure to explicitly list the `fields` array.
*   Add any read-only fields to `read_only_fields`.

## 4. ViewSet Definition
*   Create or update the ViewSet in `views.py`.
*   Ensure it inherits from the appropriate DRF generic class (e.g., `ModelViewSet` or `ListAPIView`).
*   Define `queryset` and `serializer_class`.

## 5. URL Routing
*   Register the ViewSet using a DRF `DefaultRouter` in the app's `urls.py`.

## 6. Syncing with Frontend (Crucial Step)
*   Once the backend code is written, regenerate the OpenAPI schema to ensure the frontend `openapi-fetch` types are updated.
*   Run the following command to output the schema (adjust the output path if your frontend expects it elsewhere):
    ```bash
    docker compose -f docker-compose.local.yml run --rm django python manage.py spectacular --file schema.yml
    ```
*   *(Optional)* Run the `openapi-typescript` generator command in the frontend to update the TS file.
