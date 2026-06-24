<template>
  <div>
    <page-header
      eyebrow="Administration"
      title="Protokolle"
      subtitle="Request- und Audit-Logs des panda3backend nachvollziehen und filtern."
      :icon="mdiTextBoxSearchOutline"
    />

    <v-card
      border
      flat
    >
      <div class="d-flex align-center flex-wrap ga-3 pa-3">
        <v-tabs
          v-model="tab"
          color="primary"
        >
          <v-tab value="request">
            <v-icon
              start
              :icon="mdiSwapVerticalBold"
            />
            Request-Logs
          </v-tab>
          <v-tab value="audit">
            <v-icon
              start
              :icon="mdiClipboardTextClockOutline"
            />
            Audit-Logs
          </v-tab>
        </v-tabs>
        <v-spacer />
        <v-switch
          v-model="requestLoggerOn"
          color="success"
          hide-details
          density="compact"
          :label="`Request-Logger ${requestLoggerOn ? 'aktiv' : 'inaktiv'}`"
          class="flex-grow-0"
          @update:model-value="onToggleLogger"
        />
      </div>
      <v-divider />

      <div class="pa-3">
        <v-text-field
          v-model="search"
          :prepend-inner-icon="mdiMagnify"
          label="In Protokollen filtern"
          hide-details
          clearable
          density="comfortable"
          class="mb-2"
        />
      </div>

      <v-tabs-window v-model="tab">
        <v-tabs-window-item value="request">
          <v-data-table
            :headers="requestHeaders"
            :items="requestLogs"
            :search="search"
            :loading="loading"
            :items-per-page="12"
            density="comfortable"
          >
            <template #[`item.timestamp`]="{ item }">
              <span class="text-no-wrap">{{
                formatDateTime(item.timestamp)
              }}</span>
            </template>
            <template #[`item.method`]="{ item }">
              <v-chip
                size="x-small"
                label
                variant="tonal"
                :color="methodColor(item.method)"
                >{{ item.method }}</v-chip
              >
            </template>
            <template #[`item.path`]="{ item }">
              <code>{{ item.path }}</code>
            </template>
            <template #[`item.status`]="{ item }">
              <v-chip
                size="small"
                label
                variant="tonal"
                :color="httpStatusColor(item.status)"
                >{{ item.status }}</v-chip
              >
            </template>
            <template #[`item.duration_ms`]="{ item }">
              <span :class="item.duration_ms > 600 ? 'text-warning' : ''">
                {{ item.duration_ms }} ms
              </span>
            </template>
          </v-data-table>
        </v-tabs-window-item>

        <v-tabs-window-item value="audit">
          <v-data-table
            :headers="auditHeaders"
            :items="auditLogs"
            :search="search"
            :loading="loading"
            :items-per-page="12"
            density="comfortable"
          >
            <template #[`item.timestamp`]="{ item }">
              <span class="text-no-wrap">{{
                formatDateTime(item.timestamp)
              }}</span>
            </template>
            <template #[`item.actor`]="{ item }">
              <div class="d-flex align-center ga-2 py-1">
                <v-avatar
                  color="primary"
                  size="28"
                  class="text-caption font-weight-bold"
                  >{{ initials(item.actor) }}</v-avatar
                >
                <code>{{ item.actor }}</code>
              </div>
            </template>
            <template #[`item.target`]="{ item }">
              <code>{{ item.target }}</code>
            </template>
            <template #[`item.outcome`]="{ item }">
              <status-chip :indicator="outcomeIndicator(item.outcome)" />
            </template>
          </v-data-table>
        </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import {
  mdiClipboardTextClockOutline,
  mdiMagnify,
  mdiSwapVerticalBold,
  mdiTextBoxSearchOutline,
} from "@mdi/js";
import { onMounted, ref } from "vue";

import PageHeader from "@/components/common/PageHeader.vue";
import StatusChip from "@/components/common/StatusChip.vue";
import { STATUS_INDICATORS } from "@/constants";
import { mockApi } from "@/mock/api";
import { useSnackbarStore } from "@/stores/snackbar";
import { type AuditLog, type RequestLog } from "@/types/domain";
import {
  formatDateTime,
  httpStatusColor,
  initials,
  outcomeIndicator,
} from "@/util/display";

const snackbar = useSnackbarStore();
const tab = ref("request");
const search = ref("");
const loading = ref(true);
const requestLoggerOn = ref(true);
const requestLogs = ref<RequestLog[]>([]);
const auditLogs = ref<AuditLog[]>([]);

const requestHeaders = [
  { title: "Zeitpunkt", key: "timestamp" },
  { title: "Methode", key: "method", sortable: false },
  { title: "Pfad", key: "path" },
  { title: "Status", key: "status" },
  { title: "Dauer", key: "duration_ms" },
  { title: "Benutzer", key: "user" },
  { title: "Client-IP", key: "client_ip" },
];

const auditHeaders = [
  { title: "Zeitpunkt", key: "timestamp" },
  { title: "Akteur", key: "actor" },
  { title: "Aktion", key: "action" },
  { title: "Ziel", key: "target" },
  { title: "Ergebnis", key: "outcome" },
];

async function load(): Promise<void> {
  loading.value = true;
  const [req, aud] = await Promise.all([
    mockApi.requestLogs(),
    mockApi.auditLogs(),
  ]);
  requestLogs.value = req;
  auditLogs.value = aud;
  loading.value = false;
}

onMounted(load);

function methodColor(method: string): string {
  switch (method) {
    case "GET":
      return "info";
    case "POST":
      return "success";
    case "DELETE":
      return "error";
    default:
      return "primary";
  }
}

function onToggleLogger(value: boolean | null): void {
  snackbar.push({
    text: `Request-Logger ${value ? "aktiviert" : "deaktiviert"}.`,
    color: STATUS_INDICATORS.INFO,
  });
}
</script>
