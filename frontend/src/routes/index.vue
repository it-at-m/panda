<template>
  <div>
    <page-header
      :eyebrow="today"
      :title="`Willkommen zurück, ${firstName}`"
      subtitle="Überblick über Token, Signaturen und Plattform-Betrieb der Landeshauptstadt München."
      :icon="mdiViewDashboardOutline"
    >
      <template #actions>
        <v-btn
          :prepend-icon="mdiAccountSearch"
          color="primary"
          variant="flat"
          to="/token"
        >
          Person suchen
        </v-btn>
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

    <!-- KPI cards -->
    <v-row>
      <v-col
        v-for="kpi in kpis"
        :key="kpi.label"
        cols="12"
        sm="6"
        lg="3"
      >
        <stat-card
          :label="kpi.label"
          :value="kpi.value"
          :icon="kpi.icon"
          :color="kpi.color"
          :trend="kpi.trend"
          :trend-direction="kpi.trendDirection"
          :to="kpi.to"
        />
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <!-- System health -->
      <v-col
        cols="12"
        lg="8"
      >
        <section-card
          title="Plattform-Status"
          subtitle="panda3backend · Cluster-Instanz"
          :icon="mdiServerNetwork"
        >
          <template #append>
            <status-chip
              :indicator="
                cronHealthIndicator(cron?.overall_health ?? 'healthy')
              "
              dot
            />
          </template>

          <v-row>
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <div class="metric">
                <v-icon
                  :icon="mdiClockCheckOutline"
                  color="success"
                />
                <div>
                  <div class="text-h6 font-weight-bold">
                    {{ readiness ? formatUptime(readiness.uptime) : "—" }}
                  </div>
                  <div class="text-caption text-medium-emphasis">Uptime</div>
                </div>
              </div>
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <div class="metric">
                <v-icon
                  :icon="mdiDatabaseCheckOutline"
                  :color="cron?.cache_status.reachable ? 'success' : 'error'"
                />
                <div>
                  <div class="text-h6 font-weight-bold">
                    {{ cron?.cache_status.reachable ? "Erreichbar" : "Fehler" }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ cron?.cache_status.backend ?? "Cache" }}
                  </div>
                </div>
              </div>
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <div class="metric">
                <v-icon
                  :icon="mdiCheckCircleOutline"
                  color="success"
                />
                <div>
                  <div class="text-h6 font-weight-bold">
                    {{ cron?.jobs.succeeded ?? 0 }}/{{
                      cron?.jobs.registered ?? 0
                    }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Jobs erfolgreich
                  </div>
                </div>
              </div>
            </v-col>
            <v-col
              cols="12"
              sm="6"
              md="3"
            >
              <div class="metric">
                <v-icon
                  :icon="mdiAlertCircleOutline"
                  :color="(cron?.jobs.failed ?? 0) > 0 ? 'error' : 'success'"
                />
                <div>
                  <div class="text-h6 font-weight-bold">
                    {{ cron?.jobs.failed ?? 0 }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Fehlgeschlagen
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-alert
            v-if="cron?.status_text"
            type="warning"
            variant="tonal"
            density="comfortable"
            class="mt-4"
            :text="cron.status_text"
          />
        </section-card>
      </v-col>

      <!-- Token type distribution -->
      <v-col
        cols="12"
        lg="4"
      >
        <section-card
          title="Token-Bestand"
          subtitle="Aktive Faktoren nach Typ"
          :icon="mdiChartDonut"
        >
          <div
            v-for="dist in tokenDistribution"
            :key="dist.label"
            class="mb-3"
          >
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span class="d-flex align-center ga-2">
                <v-icon
                  :icon="dist.icon"
                  size="18"
                  :color="dist.color"
                />
                {{ dist.label }}
              </span>
              <span class="font-weight-bold">{{ dist.count }}</span>
            </div>
            <v-progress-linear
              :model-value="dist.count"
              :max="maxTokenCount"
              :color="dist.color"
              height="8"
              rounded
            />
          </div>
        </section-card>
      </v-col>
    </v-row>

    <v-row class="mt-1">
      <!-- Recent auth activity -->
      <v-col
        cols="12"
        lg="7"
      >
        <section-card
          title="Letzte Authentifizierungen"
          subtitle="Über alle Backends (DUO & PrivacyIDEA)"
          :icon="mdiHistory"
        >
          <template #append>
            <v-btn
              size="small"
              variant="text"
              to="/logs"
              :append-icon="mdiArrowRight"
              >Alle</v-btn
            >
          </template>
          <v-table density="comfortable">
            <thead>
              <tr>
                <th class="text-left">Person</th>
                <th class="text-left d-none d-sm-table-cell">Anwendung</th>
                <th class="text-left">Faktor</th>
                <th class="text-left">Ergebnis</th>
                <th class="text-right">Zeit</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(entry, i) in recentAuth"
                :key="i"
              >
                <td class="font-weight-medium">{{ entry.user }}</td>
                <td class="d-none d-sm-table-cell">
                  {{ entry.application_name }}
                </td>
                <td>
                  <span class="text-caption">{{ entry.factor }}</span>
                </td>
                <td>
                  <status-chip :indicator="authResultIndicator(entry.result)" />
                </td>
                <td class="text-right text-medium-emphasis text-caption">
                  {{ relativeTime(entry.timestamp) }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </section-card>
      </v-col>

      <!-- Attention list + quick actions -->
      <v-col
        cols="12"
        lg="5"
      >
        <section-card
          title="Erfordert Aufmerksamkeit"
          :icon="mdiBellAlertOutline"
          color="warning"
          class="mb-4"
        >
          <v-list
            lines="two"
            class="py-0"
          >
            <v-list-item
              v-for="item in attention"
              :key="item.title"
              :to="item.to"
              rounded="lg"
              class="px-2"
            >
              <template #prepend>
                <v-avatar
                  :color="item.color"
                  variant="tonal"
                  rounded="lg"
                >
                  <v-icon :icon="item.icon" />
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">{{
                item.title
              }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.text }}</v-list-item-subtitle>
              <template #append>
                <v-icon
                  :icon="mdiChevronRight"
                  class="text-medium-emphasis"
                />
              </template>
            </v-list-item>
          </v-list>
        </section-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import {
  mdiAccountSearch,
  mdiAlertCircleOutline,
  mdiArrowRight,
  mdiBellAlertOutline,
  mdiCellphone,
  mdiChartDonut,
  mdiCheckCircleOutline,
  mdiChevronRight,
  mdiClockCheckOutline,
  mdiClockOutline,
  mdiDatabaseCheckOutline,
  mdiEmailAlertOutline,
  mdiFileSign,
  mdiHistory,
  mdiKey,
  mdiRefresh,
  mdiServerNetwork,
  mdiShieldKeyOutline,
  mdiUsbFlashDrive,
  mdiViewDashboardOutline,
} from "@mdi/js";
import { computed, onMounted, ref } from "vue";

import PageHeader from "@/components/common/PageHeader.vue";
import SectionCard from "@/components/common/SectionCard.vue";
import StatCard from "@/components/common/StatCard.vue";
import StatusChip from "@/components/common/StatusChip.vue";
import { mockApi } from "@/mock/api";
import {
  type AuthlogEntry,
  type CronStatus,
  type Readiness,
  type TokenPerson,
} from "@/types/domain";
import {
  authResultIndicator,
  cronHealthIndicator,
  formatUptime,
  relativeTime,
} from "@/util/display";

const loading = ref(true);
const readiness = ref<Readiness>();
const cron = ref<CronStatus>();
const people = ref<TokenPerson[]>([]);
const consentOpen = ref(0);
const fesEnabled = ref(0);

const firstName = "Anna";
const today = new Date().toLocaleDateString("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

async function load(): Promise<void> {
  loading.value = true;
  const [r, c, p, consents, fes] = await Promise.all([
    mockApi.readiness(),
    mockApi.cronStatus(),
    mockApi.listTokenPeople(),
    mockApi.consentRequests(),
    mockApi.listFesEnabled(),
  ]);
  readiness.value = r;
  cron.value = c;
  people.value = p;
  consentOpen.value = consents.filter((x) => x.Status === "pending").length;
  fesEnabled.value = fes.length;
  loading.value = false;
}

onMounted(load);

const allTokens = computed(() => people.value.flatMap((p) => p.token));
const yubikeyCount = computed(
  () => allTokens.value.filter((t) => t.kind === "Yubikey").length
);
const activeUsers = computed(
  () => people.value.filter((p) => p.token.length > 0).length
);

const kpis = computed(() => [
  {
    label: "Aktive Token-Nutzer",
    value: activeUsers.value,
    icon: mdiShieldKeyOutline,
    color: "primary",
    trend: "+4,2 %",
    trendDirection: "up" as const,
    to: "/token",
  },
  {
    label: "Ausgegebene YubiKeys",
    value: yubikeyCount.value,
    icon: mdiUsbFlashDrive,
    color: "accent",
    trend: "+12",
    trendDirection: "up" as const,
    to: "/token",
  },
  {
    label: "FES-Signaturberechtigte",
    value: fesEnabled.value,
    icon: mdiFileSign,
    color: "info",
    trend: "+1",
    trendDirection: "up" as const,
    to: "/fes",
  },
  {
    label: "Offene App-Freigaben",
    value: consentOpen.value,
    icon: mdiEmailAlertOutline,
    color: "warning",
    trend: "2 neu",
    trendDirection: "up" as const,
    to: "/sso",
  },
]);

const tokenDistribution = computed(() => {
  const counts = {
    Yubikey: 0,
    WebAuthn: 0,
    Push: 0,
    OTP: 0,
  };
  for (const t of allTokens.value) {
    if (t.kind === "Yubikey") counts.Yubikey++;
    else if (t.kind === "PushToken") counts.Push++;
    else if (t.kind === "EinmalPin" || t.kind === "Tagespass") counts.OTP++;
    else counts.WebAuthn++;
  }
  return [
    {
      label: "YubiKey",
      count: counts.Yubikey,
      icon: mdiUsbFlashDrive,
      color: "primary",
    },
    {
      label: "WebAuthn / Passkey",
      count: counts.WebAuthn,
      icon: mdiKey,
      color: "accent",
    },
    {
      label: "Duo Mobile (Push)",
      count: counts.Push,
      icon: mdiCellphone,
      color: "info",
    },
    {
      label: "Einmal-PIN / Tagespass",
      count: counts.OTP,
      icon: mdiClockOutline,
      color: "warning",
    },
  ];
});

const maxTokenCount = computed(() =>
  Math.max(1, ...tokenDistribution.value.map((d) => d.count))
);

const recentAuth = computed(() => {
  const rows: (AuthlogEntry & { user: string })[] = [];
  for (const p of people.value) {
    for (const log of p.authlogs.slice(0, 2)) {
      rows.push({ ...log, user: p.ldap.cn });
    }
  }
  return rows
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 7);
});

const attention = computed(() => [
  {
    title: "Cronjob „sync_vpsx_db“ fehlgeschlagen",
    text: "Letzter Lauf mit Fehler beendet",
    icon: mdiAlertCircleOutline,
    color: "error",
    to: "/cron",
  },
  {
    title: `${consentOpen.value} App-Freigaben offen`,
    text: "Warten auf Genehmigung durch Admin",
    icon: mdiEmailAlertOutline,
    color: "warning",
    to: "/sso",
  },
  {
    title: "Maria Huber ist in Duo gesperrt",
    text: "Mehrfache Fehlversuche – Entsperrung nötig",
    icon: mdiShieldKeyOutline,
    color: "warning",
    to: "/token",
  },
]);
</script>

<style scoped>
.metric {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}
</style>
