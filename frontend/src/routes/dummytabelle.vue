<template>
  <div>
    <page-header
      eyebrow="FastAPI · OpenAPI-Codegen"
      title="Dummy-Tabelle"
      subtitle="Daten über den generierten OpenAPI-Client vom FastAPI-Backend."
      :icon="mdiTableLarge"
    >
      <template #actions>
        <v-btn
          :prepend-icon="mdiRefresh"
          variant="tonal"
          :loading="loading"
          @click="loadUsers"
        >
          Neu laden
        </v-btn>
      </template>
    </page-header>

    <section-card
      title="Benutzer"
      subtitle="GET /api/backend/users · generierte Methode demoApi.getUsers()"
      :icon="mdiAccountGroupOutline"
    >
      <template #append>
        <v-chip
          size="small"
          variant="tonal"
          label
          >{{ users.length }}</v-chip
        >
      </template>

      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        density="comfortable"
        class="mb-4"
        :text="error"
      />

      <v-data-table
        :headers="headers"
        :items="users"
        :loading="loading"
        item-value="id"
        density="comfortable"
      >
        <template #[`item.active`]="{ item }">
          <status-chip
            :indicator="
              item.active
                ? { color: 'success', label: 'Aktiv' }
                : { color: 'error', label: 'Inaktiv' }
            "
            dot
          />
        </template>
      </v-data-table>
    </section-card>
  </div>
</template>

<script setup lang="ts">
import type { User } from "@/api/generated/demo";

import { mdiAccountGroupOutline, mdiRefresh, mdiTableLarge } from "@mdi/js";
import { onMounted, ref } from "vue";

import { Configuration, DemoApi } from "@/api/generated/demo";
import PageHeader from "@/components/common/PageHeader.vue";
import SectionCard from "@/components/common/SectionCard.vue";
import StatusChip from "@/components/common/StatusChip.vue";

// The generated client uses relative paths (basePath ""), so requests go to
// /api/backend/... and are proxied by the Vite dev server to the backend.
const demoApi = new DemoApi(new Configuration({ basePath: "" }));

const users = ref<User[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const headers = [
  { title: "ID", key: "id" },
  { title: "Name", key: "name" },
  { title: "Abteilung", key: "department" },
  { title: "E-Mail", key: "email" },
  { title: "Status", key: "active" },
];

async function loadUsers(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    users.value = await demoApi.getUsers();
  } catch {
    error.value =
      "Backend nicht erreichbar. Läuft der FastAPI-Container? (cd backend && docker compose up --build)";
  } finally {
    loading.value = false;
  }
}

onMounted(loadUsers);
</script>
