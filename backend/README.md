# Panda Backend (FastAPI)

Minimal FastAPI backend that the Vue frontend talks to.

## Start

```bash
cd backend
docker compose up --build
```

The backend is then reachable on **http://localhost:8083**.

- Hello world: http://localhost:8083/api/backend/hello → `{"message": "Hallo Welt"}`
- Dummy table: http://localhost:8083/api/backend/users → list of users
- Health: http://localhost:8083/actuator/health
- OpenAPI definition: http://localhost:8083/openapi.json
- Interactive API docs: http://localhost:8083/docs

## How the frontend reaches it

The Vite dev server (port `8081`) proxies `/api` and `/actuator` to
`http://localhost:8083` (see `frontend/vite.config.ts`). The frontend uses
`VITE_BASE_API_PATH=/api/backend`, so a call to `/api/backend/hello` from the
frontend lands on this backend.

Start order does not matter — start the backend with Docker, run the frontend
with `npm run dev`, and open the app.
