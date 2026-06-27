# Tutorial: OpenAPI-Client generieren und eine Tabelle anzeigen

Im [ersten Tutorial](./frontend-backend-hallowelt.md) haben wir den `fetch`-Aufruf
von Hand geschrieben. Diesmal machen wir es richtig: Wir holen die
**OpenAPI-Definition** direkt vom FastAPI-Server, generieren daraus mit dem
`openapi-generator` einen **typsicheren TypeScript-Client** und nutzen die
generierten Funktionen auf einer eigenen Seite, um eine Tabelle anzuzeigen.

> **Kein Java nötig.** Der Generator läuft über das offizielle Docker-Image —
> einzige Voraussetzung ist Docker (das du für das Backend sowieso brauchst).

## Überblick: Der Workflow

```text
 1. Backend           2. Spec holen + generieren      3. Benutzen
┌──────────────┐     ┌───────────────────────────┐   ┌─────────────────┐
│ FastAPI       │     │ fetch-and-generate-api.sh  │   │ dummytabelle.vue│
│ /users        │──▶  │                            │──▶│ DemoApi          │
│ /openapi.json │     │  curl → demo-openapi.json  │   │ .getUsers()      │
└──────────────┘     │  docker run generator      │   │ User[]           │
  docker compose     └───────────────────────────┘   └─────────────────┘
```

## Schritt 1 – Endpunkt mit typisierten Daten im Backend

Damit der Generator gute Typen und schöne Namen erzeugt, braucht jeder Endpunkt:

- ein **Pydantic-Modell** als Rückgabetyp → erzeugt ein TypeScript-Interface
- `operation_id` → wird der generierte Methodenname
- `tags=["demo"]` → wird der generierte Klassenname (`DemoApi`)

```python
# backend/app/main.py
from pydantic import BaseModel


class User(BaseModel):
    id: int
    name: str
    department: str
    email: str
    active: bool


@app.get("/api/backend/users", operation_id="getUsers", tags=["demo"])
def get_users() -> list[User]:
    return _DUMMY_USERS
```

Nach einer API-Änderung das Backend neu starten:

```bash
cd backend && docker compose up --build
```

Prüfen: <http://localhost:8083/api/backend/users> und
<http://localhost:8083/openapi.json>

## Schritt 2 – Script: Spec holen + Client generieren

Das Script [`frontend/fetch-and-generate-api.sh`](../frontend/fetch-and-generate-api.sh)
macht genau zwei Dinge:

1. `curl` holt `openapi.json` vom laufenden FastAPI-Server und speichert sie
   als `src/api/demo-openapi.json`
2. `docker run` startet den Generator und schreibt den TypeScript-Client nach
   `src/api/generated/demo/`

```bash
#!/usr/bin/env bash
set -euo pipefail

BACKEND_URL="${BACKEND_URL:-http://localhost:8083}"
GENERATOR_VERSION="7.23.0"
SPEC_FILE="src/api/demo-openapi.json"
OUTPUT_DIR="src/api/generated/demo"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# 1) OpenAPI-Definition vom Server holen
curl --fail --silent --show-error "${BACKEND_URL}/openapi.json" -o "${SPEC_FILE}"

# 2) TypeScript-Client via Docker generieren (kein Java nötig!)
docker run --rm \
  -v "${SCRIPT_DIR}:/local" \
  -w /local \
  "openapitools/openapi-generator-cli:v${GENERATOR_VERSION}" \
  generate \
    -i "/local/${SPEC_FILE}" \
    -g typescript-fetch \
    -o "/local/${OUTPUT_DIR}" \
    --additional-properties=\
supportsES6=true,\
enumPropertyNaming=UPPERCASE,\
disallowAdditionalPropertiesIfNotPresent=false,\
useSingleRequestParameter=false,\
validationAttributes=true
```

Ausführen — entweder direkt oder über das npm-Script:

```bash
cd frontend
npm run generate-demo-api
# oder: ./fetch-and-generate-api.sh
```

Danach existiert der generierte Client:

```text
src/api/generated/demo/
├── apis/
│   └── DemoApi.ts        ← Klasse DemoApi mit Methode getUsers()
├── models/
│   └── User.ts           ← Interface User { id, name, department, email, active }
├── index.ts              ← Barrel-Export (alles re-exportiert)
└── runtime.ts            ← Configuration, BaseAPI, fetch-Wrapper
```

> **Warum `demo-openapi.json` committen?** Die gespeicherte Spec ermöglicht es,
> den Client jederzeit neu zu generieren — auch ohne laufendes Backend (z. B. in
> CI). Sie ist die "Source of Truth" für den generierten Client.

## Schritt 3 – Generierten Client auf der Seite benutzen

Wir instanziieren `DemoApi` und rufen `getUsers()` auf. `basePath: ""` sorgt
dafür, dass der Client relative Pfade erzeugt — die der Vite-Proxy an den
Backend-Container durchreicht.

```vue
<!-- frontend/src/routes/dummytabelle.vue -->
<template>
  <v-data-table :headers="headers" :items="users" :loading="loading" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

import type { User } from "@/api/generated/demo";

import { Configuration, DemoApi } from "@/api/generated/demo";

// basePath "" → erzeugt relative URLs wie /api/backend/users
// → Vite-Proxy leitet diese an http://localhost:8083 weiter
const demoApi = new DemoApi(new Configuration({ basePath: "" }));

const users = ref<User[]>([]);
const loading = ref(false);

const headers = [
  { title: "ID", key: "id" },
  { title: "Name", key: "name" },
  { title: "Abteilung", key: "department" },
  { title: "E-Mail", key: "email" },
  { title: "Status", key: "active" },
];

async function loadUsers(): Promise<void> {
  loading.value = true;
  users.value = await demoApi.getUsers(); // ← typsicher, generiert
  loading.value = false;
}

onMounted(loadUsers);
</script>
```

Die Variable `users` ist vollständig typisiert — die IDE kennt `id`, `name`,
`department`, `email` und `active` als Felder, direkt aus der OpenAPI-Spec.

## Schritt 4 – Navigationseintrag

Die Datei `src/routes/dummytabelle.vue` wird durch dateibasiertes Routing
automatisch zur Route `/dummytabelle`. Dazu kommt noch ein Eintrag in die
Navigationsleiste und eine Übersetzung:

```vue
<!-- frontend/src/components/TheNavigationDrawer.vue -->
<v-list-item
  :prepend-icon="mdiTableLarge"
  :title="t('nav.dummytabelle')"
  to="/dummytabelle"
  rounded="lg"
/>
```

```json
// frontend/src/locales/de.json
"nav": { "dummytabelle": "Dummy-Tabelle" }
```

## Kompletter Ablauf von Null

```bash
# Terminal 1 – Backend starten
cd backend && docker compose up --build

# Terminal 2 – Client generieren (Backend muss laufen, Docker erforderlich)
cd frontend && npm run generate-demo-api

# Frontend starten
npm run dev
```

Dann <http://localhost:8081> öffnen → **„Dummy-Tabelle"** in der Navigation.

## API ändert sich – was tun?

1. Backend-Code anpassen (`backend/app/main.py`)
2. Backend neu starten: `docker compose up --build` (im `backend/`-Ordner)
3. Client neu generieren: `npm run generate-demo-api` (im `frontend/`-Ordner)

Der generierte Code unter `src/api/generated/demo/` wird dabei komplett
überschrieben — **nie von Hand editieren**.
