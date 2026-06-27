# Tutorial: Frontend mit dem FastAPI-Backend verbinden ("Hallo Welt")

Dieses Tutorial zeigt Schritt für Schritt, wie das Vue-Frontend eine Nachricht
vom FastAPI-Backend lädt und auf einer eigenen Seite **„Hallo Welt“** über einen
Button anzeigt – inklusive Pinia-Store.

## Überblick: Wie hängt alles zusammen?

```
┌────────────────────┐   GET /api/backend/hello   ┌────────────────────────┐
│  Vue-Frontend       │ ─────────────────────────▶ │  FastAPI (Docker)       │
│  localhost:8081     │                            │  localhost:8083         │
│                     │ ◀───────────────────────── │  { "message":           │
│  Vite-Dev-Proxy     │     { "message": ... }     │    "Hallo Welt" }       │
└────────────────────┘                            └────────────────────────┘
```

Der Trick: Der **Vite-Dev-Server proxyt** alle `/api`- und `/actuator`-Aufrufe
an `http://localhost:8083`. Dadurch laufen Frontend und Backend für den Browser
auf derselben Origin – kein CORS-Stress, keine absolute URL im Code.

```ts
// frontend/vite.config.ts
server: {
  port: 8081,
  proxy: {
    "/api": "http://localhost:8083",
    "/actuator": "http://localhost:8083",
  },
},
```

Die Basis für alle API-Pfade kommt aus einer Env-Variable:

```bash
# frontend/.env
VITE_BASE_API_PATH="/api/backend"
```

## Schritt 1 – Backend starten

Das Backend liegt im Ordner [`backend/`](../backend) und wird komplett über
Docker beschrieben. Starten:

```bash
cd backend
docker compose up --build
```

Test im Browser: <http://localhost:8083/api/backend/hello> →
`{"message":"Hallo Welt"}`

Der Endpunkt selbst ist nur wenige Zeilen:

```python
# backend/app/main.py
from fastapi import FastAPI

app = FastAPI(title="Panda Backend")

@app.get("/api/backend/hello")
def hello() -> dict[str, str]:
    return {"message": "Hallo Welt"}
```

> Wichtig: Der Pfad im FastAPI (`/api/backend/hello`) muss zum Frontend-Pfad
> passen, weil der Proxy den Pfad unverändert durchreicht.

## Schritt 2 – API-Client im Frontend

Ein kleiner Client kapselt den `fetch`-Aufruf. `BASE_API_PATH` kommt aus der
Env-Variable und ergibt zusammen den Pfad `/api/backend/hello`.

```ts
// frontend/src/api/hello-client.ts
import { defaultResponseHandler, getConfig } from "@/api/fetch-utils";
import { BASE_API_PATH } from "@/constants";

export interface HelloResponse {
  message: string;
}

export function getHello(): Promise<HelloResponse> {
  return fetch(`${BASE_API_PATH}/hello`, getConfig()).then((response) => {
    defaultResponseHandler(response);
    return response.json();
  });
}
```

## Schritt 3 – Pinia-Store

Der Store hält die Nachricht sowie Lade- und Fehlerzustand und kapselt den
API-Aufruf. So bleibt die Komponente schlank und der Zustand ist
wiederverwendbar.

```ts
// frontend/src/stores/hello.ts
import { defineStore } from "pinia";
import { readonly, ref } from "vue";

import { getHello } from "@/api/hello-client";

export const useHelloStore = defineStore("hello", () => {
  const internalMessage = ref<string | null>(null);
  const message = readonly(internalMessage);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchHello(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const response = await getHello();
      internalMessage.value = response.message;
    } catch {
      internalMessage.value = null;
      error.value = "Backend nicht erreichbar. Läuft der FastAPI-Container?";
    } finally {
      loading.value = false;
    }
  }

  return { message, loading, error, fetchHello };
});
```

## Schritt 4 – Die Seite mit Button

Die Seite liegt unter `src/routes/` – das Projekt nutzt **dateibasiertes
Routing** (`vue-router/vite`). Eine Datei `hallowelt.vue` wird automatisch zur
Route `/hallowelt`. Die Komponente liest den Store und löst beim Klick
`fetchHello()` aus.

```vue
<!-- frontend/src/routes/hallowelt.vue -->
<template>
  <v-btn color="primary" :loading="hello.loading" @click="hello.fetchHello">
    Lade HalloWelt
  </v-btn>

  <v-alert v-if="hello.error" type="error" :text="hello.error" />
  <div v-else-if="hello.message">{{ hello.message }}</div>
</template>

<script setup lang="ts">
import { useHelloStore } from "@/stores/hello";

const hello = useHelloStore();
</script>
```

> Warum kein automatisches Laden? Genau so wie gefordert: Die Ausgabe erscheint
> erst, wenn man den Button **„Lade HalloWelt“** drückt.

## Schritt 5 – Navigationseintrag

Damit die Seite erreichbar ist, kommt ein Eintrag in die Navigationsleiste
([`TheNavigationDrawer.vue`](../frontend/src/components/TheNavigationDrawer.vue)).
Beschriftungen laufen über i18n (`src/locales/de.json`).

```vue
<!-- frontend/src/components/TheNavigationDrawer.vue -->
<v-list-item
  :prepend-icon="mdiHandWaveOutline"
  :title="t('nav.hallowelt')"
  to="/hallowelt"
  rounded="lg"
/>
```

```json
// frontend/src/locales/de.json
"nav": {
  "hallowelt": "Hallo Welt"
}
```

## Ausprobieren

1. Backend starten: `cd backend && docker compose up --build`
2. Frontend starten: `cd frontend && npm run dev`
3. <http://localhost:8081> öffnen → in der Navigation **„Hallo Welt“** wählen
4. Auf **„Lade HalloWelt“** klicken → die Nachricht vom FastAPI-Server erscheint.

## Eigene Endpunkte ergänzen

Nach demselben Muster einen neuen Endpunkt anbinden:

1. **Backend**: neue Route in `backend/app/main.py` unter `/api/backend/...`.
2. **Client**: Funktion in einer Datei unter `src/api/` ergänzen.
3. **Store** (optional): Zustand + Aufruf in `src/stores/` kapseln.
4. **UI**: in einer `*.vue`-Datei unter `src/routes/` verwenden.
