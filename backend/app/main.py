from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Panda Backend", version="0.1.0")

# Allow direct access from the Vite dev server. When the frontend talks to the
# backend through the Vite proxy this is not needed, but it keeps direct calls
# (e.g. opening http://localhost:8083/api/backend/hello in the browser) working.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/backend/hello", operation_id="getHello", tags=["demo"])
def hello() -> dict[str, str]:
    """Simple hello world endpoint consumed by the frontend."""
    return {"message": "Hallo Welt"}


class User(BaseModel):
    """A single row of the dummy user table."""

    id: int
    name: str
    department: str
    email: str
    active: bool


# Static dummy data so the endpoint always returns a predictable table.
_DUMMY_USERS: list[User] = [
    User(id=1, name="Anna Bauer", department="RIT", email="anna.bauer@muenchen.de", active=True),
    User(id=2, name="Bernd Schmidt", department="KVR", email="bernd.schmidt@muenchen.de", active=True),
    User(id=3, name="Clara Vogel", department="RBS", email="clara.vogel@muenchen.de", active=False),
    User(id=4, name="David Huber", department="RIT", email="david.huber@muenchen.de", active=True),
    User(id=5, name="Eva Lang", department="POR", email="eva.lang@muenchen.de", active=False),
]


@app.get("/api/backend/users", operation_id="getUsers", tags=["demo"])
def get_users() -> list[User]:
    """Returns dummy table data consumed by the generated frontend client."""
    return _DUMMY_USERS


@app.get("/actuator/health")
def health() -> dict[str, str]:
    """Health endpoint matching the path the frontend already probes."""
    return {"status": "UP"}
