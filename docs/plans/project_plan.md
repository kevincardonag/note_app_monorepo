# Note-Taking Application Implementation Plan

This plan outlines the end-to-end implementation of the Note-Taking Application, following "Two Scoops of Django" best practices, strictly adhering to the defined architecture conventions, incorporating the provided Figma design requirements, and utilizing **PostgreSQL** and **JWT** for authentication.

## Proposed Changes

---

### Backend (Django + DRF)

**Database & Auth Setup:**
- **PostgreSQL**: Configure `DATABASES` in `settings.py` using `django-environ` to read from the `.env` file. We will use `psycopg` (or `psycopg2-binary`) as the database adapter.
- **JWT**: Integrate `djangorestframework-simplejwt` to handle stateless authentication tokens.

**Best Practices ("Two Scoops of Django" & Defined Rules):**
- **Fat Models, Skinny Views:** Core logic (like user initialization) will reside in Models/Signals. ViewSets will only handle request/response parsing.
- **Explicit Serializers:** No `fields = "__all__"`.

#### [NEW] `backend/notes/models.py` (Update)
- **Category Model:** `name`, `color` (hex string), `user` (ForeignKey to User).
- **Note Model:** `title`, `content` (TextField), `category` (ForeignKey to Category), `user` (ForeignKey to User), `updated_at` (auto_now=True), `created_at` (auto_now_add=True).

#### [NEW] `backend/users/signals.py`
- Listen for `post_save` on the `User` model. When a new user is created, automatically generate the default categories: "Random Thoughts", "School", and "Personal" with distinct default colors.

#### [NEW] `backend/notes/serializers.py`
- `CategorySerializer`: Explicit fields (`id`, `name`, `color`).
- `NoteSerializer`: Explicit fields (`id`, `title`, `content`, `category_id`, `category`, `updated_at`). Nested category for read, ID for write.

#### [NEW] `backend/notes/views.py`
- `CategoryViewSet` & `NoteViewSet`: Standard `ModelViewSet` inheriting from a base class that enforces `permission_classes = [IsAuthenticated]` and overrides `get_queryset()` to filter by `self.request.user`.

#### [NEW] `backend/users/views.py`
- `SignUpView`: Endpoint to register a user.
- **Login**: Use standard `TokenObtainPairView` provided by `simplejwt` mapped to `/api/token/` and `/api/token/refresh/`.

#### [NEW] `backend/core/urls.py` & `backend/notes/urls.py`
- Register viewsets via DRF DefaultRouter.
- Add endpoints for `drf-spectacular` OpenAPI schema (`/api/schema/`).

---

### Frontend (Next.js)

**Architecture Rules:**
- Server Components by default. State/Interactivity pushed to leaf client components.
- Tailwind CSS exclusively.
- API consumption via `openapi-fetch`, passing the JWT in the Authorization header.

#### [NEW] `frontend/src/lib/api.ts`
- Setup `openapi-fetch` client configured to hit the Django backend.
- Script to run `npx openapi-typescript http://localhost:8000/api/schema/ -o src/lib/api-schema.d.ts` for end-to-end type safety.

#### [NEW] `frontend/src/app/(auth)/login/page.tsx` & `frontend/src/app/(auth)/signup/page.tsx`
- **Figma Alignment:** Based on the Figma design token "Login" found in the MCP analysis.
- **Features:** Email, Password input with visibility toggle (Client Component). Server Action for form submission. Stores the JWT securely (e.g., in an HTTP-only cookie).

#### [NEW] `frontend/src/app/page.tsx` (Main Dashboard)
- **Server Component:** Fetches Categories and Notes via `openapi-fetch` passing the JWT.
- **Layout:**
  - **Sidebar:** Lists categories, colors, and note counts.
  - **Main Area:** Grid of Note preview cards.

#### [NEW] `frontend/src/components/NoteCard.tsx`
- **Features:** Displays Date (formatted as "Today", "Yesterday", or "MMM DD"), category badge with dynamic color, title, and truncated content.

#### [NEW] `frontend/src/components/NoteEditor.tsx` (Client Component Modal/Page)
- Real-time editing. Debounced saves or explicit save button. 
- Category dropdown that dynamically changes the background color of the note context based on the selected category color.

---

## Unit Testing Plan

### 1. Backend Testing (`pytest`, `pytest-django`)

**Tools**: `pytest`, `pytest-django`, `model_bakery` (or FactoryBoy) for object generation.

- **Models & Signals**:
  - Test that creating a `User` correctly triggers the `post_save` signal and generates exactly 3 default Categories in PostgreSQL.
  - Test Note and Category creation, string representations, and timestamp auto-updates.
- **Serializers**:
  - Test validation (e.g., ensuring a user cannot create a note with a category they don't own).
  - Test serialization payload matches the explicit fields requested.
- **Views & API Endpoints**:
  - Test Authentication endpoints (Signup creates a user, Login returns a valid JWT).
  - Test authorization constraints (Unauthenticated users receive 401 on restricted endpoints).
  - Test tenant isolation (User A cannot view, update, or delete User B's notes or categories).

### 2. Frontend Testing (`Vitest`, `@testing-library/react`)

**Tools**: `Vitest`, `@testing-library/react`, `msw` (Mock Service Worker) to mock OpenAPI responses.

- **Client Components**:
  - Test the **Password Toggle** component to ensure the input type switches between `"text"` and `"password"`.
  - Test the **NoteEditor** component to verify that changing a category updates the local UI state (background color) before/during the API call.
- **Server Actions & API Mocking**:
  - Use `msw` to intercept `openapi-fetch` requests.
  - Test the **Login/Signup Forms** to ensure they handle successful logins (routing to `/`) and failures (displaying error messages) correctly.
- **UI & Layout**:
  - Test the **NoteCard** component logic for the Date formatter ("Today", "Yesterday", "MMM DD") and text truncation logic.
  - Test the Sidebar to ensure note counts match the mock data provided.
