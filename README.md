# Note App Monorepo

This is a monorepo containing both the backend (Django) and frontend (Next.js) for the notes application.

## Project Structure

- `/backend`: REST API built with Django, Django REST Framework, and managed with `uv`.
- `/frontend`: Interactive web application built with Next.js and React.

## How to run locally

### 1. Backend (Django)

1. Navigate to the directory:
   ```bash
   cd backend
   ```
2. Activate the virtual environment:
   ```bash
   source .venv/bin/activate
   ```
3. Run the development server:
   ```bash
   python manage.py runserver
   ```
   *The API will be available by default at http://localhost:8000*

### 2. Frontend (Next.js)

1. Navigate to the directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The app will be available at http://localhost:3000*
