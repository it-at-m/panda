<template>
  <div>
    <page-header
      eyebrow="FastAPI-Demo"
      title="Hallo Welt"
      subtitle="Ruft die Nachricht über den Button live vom FastAPI-Backend ab."
      :icon="mdiHandWaveOutline"
    />

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <section-card
          title="Backend-Aufruf"
          subtitle="GET /api/backend/hello"
          :icon="mdiServerNetwork"
        >
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            :prepend-icon="mdiCloudDownloadOutline"
            :loading="hello.loading"
            class="mb-4"
            @click="hello.fetchHello"
          >
            Lade HalloWelt
          </v-btn>

          <v-alert
            v-if="hello.error"
            type="error"
            variant="tonal"
            density="comfortable"
            :text="hello.error"
          />
          <div
            v-else-if="hello.message"
            class="d-flex align-center ga-3 pa-4 rounded-lg bg-surface-light"
          >
            <v-icon
              :icon="mdiCheckCircleOutline"
              color="success"
            />
            <span class="text-h5 font-weight-bold">{{ hello.message }}</span>
          </div>
          <div
            v-else
            class="text-medium-emphasis"
          >
            Noch nichts geladen – klicke auf „Lade HalloWelt“.
          </div>
        </section-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import {
  mdiCheckCircleOutline,
  mdiCloudDownloadOutline,
  mdiHandWaveOutline,
  mdiServerNetwork,
} from "@mdi/js";

import PageHeader from "@/components/common/PageHeader.vue";
import SectionCard from "@/components/common/SectionCard.vue";
import { useHelloStore } from "@/stores/hello";

const hello = useHelloStore();
</script>
