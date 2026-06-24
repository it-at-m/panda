<template>
  <div>
    <page-header
      eyebrow="Administration"
      title="Cronjobs"
      subtitle="Geplante Hintergrundprozesse des panda3backend – Status, Zeitpläne und manuelle Ausführung."
      :icon="mdiClockOutline"
    >
      <template #actions>
        <v-btn
          :prepend-icon="mdiRefresh"
          variant="tonal"
          :loading="loading"
          @click="load"
        >
          Aktualisieren
        </v-btn>
      </template>
    </page-header>

    <v-row>
      <v-col
        cols="12"
        md="4"
      >
        <section-card
          title="Scheduler-Status"
          :icon="mdiHeartPulse"
        >
          <template #append>
            <status-chip
              :indicator="
                cronHealthIndicator(status?.overall_health ?? 'healthy')
              "
              dot
            />
          </template>
          <div class="d-flex align-center ga-3 mb-4">
            <v-icon
              :icon="mdiDatabaseOutline"
              :color="status?.cache_status.reachable ? 'success' : 'error'"
            />
            <div>
              <div class="text-body-2 font-weight-medium">
                {{ status?.cache_status.backend }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{
                  status?.cache_status.reachable
                    ? "Verbunden"
                    : "Nicht erreichbar"
                }}
              </div>
            </div>
          </div>
          <v-alert
            v-if="status?.status_text"
            type="warning"
            variant="tonal"
            density="compact"
            :text="status.status_text"
          />
        </section-card>
      </v-col>

      <v-col
        cols="12"
        md="8"
      >
        <v-row>
          <v-col
            v-for="s in jobStats"
            :key="s.label"
            cols="6"
            sm="4"
            md="4"
          >
            <stat-card
              :label="s.label"
              :value="s.value"
              :icon="s.icon"
              :color="s.color"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <section-card
      title="Registrierte Jobs"
      :icon="mdiFormatListChecks"
      class="mt-4"
    >
      <v-data-table
        :headers="headers"
        :items="jobs"
        :loading="loading"
        :items-per-page="10"
        density="comfortable"
        hover
      >
        <template #[`item.name`]="{ item }">
          <div class="py-1">
            <div class="font-weight-medium">{{ item.name }}</div>
            <code class="text-caption text-medium-emphasis">{{
              item.func
            }}</code>
          </div>
        </template>
        <template #[`item.expression`]="{ item }">
          <v-chip
            size="small"
            variant="tonal"
            label
            color="primary"
          >
            <v-icon
              start
              :icon="mdiClockOutline"
              size="14"
            />
            <code>{{ item.expression }}</code>
          </v-chip>
        </template>
        <template #[`item.current_state`]="{ item }">
          <status-chip :indicator="cronStateIndicator(item.current_state)" />
        </template>
        <template #[`item.run_mode`]="{ item }">
          <v-chip
            size="x-small"
            variant="outlined"
            label
          >
            {{ item.run_mode === "cluster" ? "Cluster" : "Single-Node" }}
          </v-chip>
        </template>
        <template #[`item.last_run`]="{ item }">
          {{ relativeTime(item.last_run) }}
        </template>
        <template #[`item.next_run`]="{ item }">
          {{ relativeTime(item.next_run) }}
        </template>
        <template #[`item.actions`]="{ item }">
          <v-btn
            :icon="mdiPlayCircleOutline"
            variant="text"
            size="small"
            color="primary"
            :aria-label="`Job ${item.name} jetzt ausführen`"
            @click="trigger(item.name)"
          />
        </template>
      </v-data-table>
    </section-card>
  </div>
</template>

<script setup lang="ts">
import {
  mdiAlertBoxOutline,
  mdiCheckCircleOutline,
  mdiClockOutline,
  mdiDatabaseOutline,
  mdiFormatListChecks,
  mdiHeartPulse,
  mdiPlayCircleOutline,
  mdiProgressClock,
  mdiRefresh,
} from "@mdi/js";
import { computed, onMounted, ref } from "vue";

import PageHeader from "@/components/common/PageHeader.vue";
import SectionCard from "@/components/common/SectionCard.vue";
import StatCard from "@/components/common/StatCard.vue";
import StatusChip from "@/components/common/StatusChip.vue";
import { STATUS_INDICATORS } from "@/constants";
import { mockApi } from "@/mock/api";
import { useSnackbarStore } from "@/stores/snackbar";
import { type CronJob, type CronStatus } from "@/types/domain";
import {
  cronHealthIndicator,
  cronStateIndicator,
  relativeTime,
} from "@/util/display";

const snackbar = useSnackbarStore();
const loading = ref(true);
const status = ref<CronStatus>();
const jobs = ref<CronJob[]>([]);

const headers = [
  { title: "Job", key: "name", sortable: true },
  { title: "Zeitplan", key: "expression", sortable: false },
  { title: "Status", key: "current_state" },
  { title: "Modus", key: "run_mode", sortable: false },
  { title: "Letzter Lauf", key: "last_run" },
  { title: "Nächster Lauf", key: "next_run" },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

async function load(): Promise<void> {
  loading.value = true;
  const [s, j] = await Promise.all([mockApi.cronStatus(), mockApi.cronJobs()]);
  status.value = s;
  jobs.value = j;
  loading.value = false;
}

onMounted(load);

const jobStats = computed(() => [
  {
    label: "Registriert",
    value: status.value?.jobs.registered ?? 0,
    icon: mdiFormatListChecks,
    color: "primary",
  },
  {
    label: "Erfolgreich",
    value: status.value?.jobs.succeeded ?? 0,
    icon: mdiCheckCircleOutline,
    color: "success",
  },
  {
    label: "Läuft",
    value: status.value?.jobs.running ?? 0,
    icon: mdiProgressClock,
    color: "info",
  },
  {
    label: "Fehlgeschlagen",
    value: status.value?.jobs.failed ?? 0,
    icon: mdiAlertBoxOutline,
    color: "error",
  },
  {
    label: "Nicht gestartet",
    value: status.value?.jobs.not_started ?? 0,
    icon: mdiClockOutline,
    color: "grey",
  },
]);

function trigger(name: string): void {
  snackbar.push({
    text: `Job „${name}“ wurde manuell ausgelöst.`,
    color: STATUS_INDICATORS.SUCCESS,
  });
}
</script>
