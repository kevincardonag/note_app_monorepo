# Note App Monorepo

A monorepo containing both the backend (Django REST Framework) and frontend (Next.js) for the notes application.

## Project Structure

- `/backend` — REST API built with Django, DRF, and managed with `uv`.
- `/frontend` — Interactive web application built with Next.js and React.
- `/docs` — Technical documentation, architecture guides, and implementation plans.

---

## 📚 Documentation & Technical Plans

- [Project Implementation Plan](docs/plans/project_plan.md) — Architectural overview, technical stack, and system roadmap.
- [Auto-Save & Debouncing Strategy](docs/plans/debouncing_plan.md) — Technical details of the debounced saving and modal lifecycle strategy.

---

## Run with Docker (Recommended)

Requires [Docker](https://docs.docker.com/get-docker/) installed.

```bash
# 1. Setup environment variables (first time only)
cp .env.example .env

# 2. Start all services (PostgreSQL + Backend + Frontend)
docker compose up --build

# 3. Run migrations (first time, or after model changes)
docker compose exec backend python manage.py migrate

# 4. (Optional) Seed demo notes (3 Random Thoughts, 3 School, 1 Personal)
docker compose exec backend python manage.py seed_notes

# 5. (Optional) Create a superuser for Django Admin
docker compose exec backend python manage.py createsuperuser
```

Both Django and Next.js have **hot-reload** enabled — edit your code locally and see changes instantly.

| Service       | URL                                         |
|---------------|---------------------------------------------|
| Frontend      | http://localhost:3000                        |
| Backend API   | http://localhost:8000                        |
| Django Admin  | http://localhost:8000/admin/                 |
| Swagger UI    | http://localhost:8000/api/schema/swagger-ui/ |

### Useful Commands

```bash
# View logs in real time
docker compose logs -f

# Stop all services
docker compose down

# Stop and wipe database (clean slate)
docker compose down -v

# Rebuild after dependency changes
docker compose up --build
```

---

## Run Without Docker

### 1. Backend (Django)

```bash
cd backend
source .venv/bin/activate
python manage.py runserver
```

> Requires a local PostgreSQL instance. Update `DATABASE_URL` in `backend/.env`.

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

---

## Testing & Coverage

### Backend (Django)

The backend uses `pytest` and `pytest-django`. To measure coverage, you will need `pytest-cov`.

```bash
# 1. Install pytest-cov (if not already installed)
docker compose exec backend uv add --dev pytest-cov

# 2. Run tests
docker compose exec backend pytest

# 3. Run tests with coverage report
docker compose exec backend pytest --cov=. --cov-report=term-missing
```

### Frontend (Next.js)

The frontend uses `vitest` and `@testing-library/react`. Coverage requires `@vitest/coverage-v8`.

```bash
# 1. Enter the frontend directory
cd frontend

# 2. Install coverage provider (if not already installed)
npm install -D @vitest/coverage-v8

# 3. Run tests
npm run test

# 4. Run tests with coverage report
npx vitest run --coverage
```
