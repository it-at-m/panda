<template>
  <div>
    <page-header
      eyebrow="Identity & Access"
      title="Single Sign-On"
      subtitle="Entra-ID-App-Freigaben prüfen und Keycloak-Realms der Landeshauptstadt verwalten."
      :icon="mdiKeyChainVariant"
    />

    <h2 class="text-h6 font-weight-bold mb-3 d-flex align-center ga-2">
      <v-icon
        :icon="mdiMicrosoftAzure"
        color="info"
      />
      Entra ID – App-Freigabeanträge
      <v-chip
        v-if="pendingCount"
        color="warning"
        size="small"
        variant="tonal"
        label
        >{{ pendingCount }} offen</v-chip
      >
    </h2>

    <v-row v-if="loading">
      <v-col
        v-for="n in 3"
        :key="n"
        cols="12"
        md="6"
        lg="4"
      >
        <v-skeleton-loader type="card" />
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="req in consentRequests"
        :key="req.Id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          border
          flat
          class="h-100 d-flex flex-column"
        >
          <v-card-item>
            <template #prepend>
              <v-avatar
                color="info"
                variant="tonal"
                rounded="lg"
              >
                <v-icon :icon="mdiApplicationBracesOutline" />
              </v-avatar>
            </template>
            <v-card-title class="text-subtitle-1 font-weight-bold">{{
              req.AppDisplayName
            }}</v-card-title>
            <v-card-subtitle>
              <code class="text-caption">{{ req.AppId }}</code>
            </v-card-subtitle>
            <template #append>
              <status-chip :indicator="consentStatusIndicator(req.Status)" />
            </template>
          </v-card-item>

          <v-card-text class="flex-grow-1">
            <dl class="mb-3">
              <data-field
                label="Antragsteller"
                :value="`${req.Name} · ${req.Email}`"
              />
              <data-field
                label="Begründung"
                :value="req.Reason"
                class="mt-2"
              />
              <data-field
                label="Eingegangen"
                :value="formatDateTime(req.Created)"
                class="mt-2"
              />
            </dl>
            <div class="text-caption text-medium-emphasis mb-1">
              Angeforderte Berechtigungen
            </div>
            <div class="d-flex ga-1 flex-wrap">
              <v-chip
                v-for="scope in req.Scopes"
                :key="scope"
                size="x-small"
                label
                variant="outlined"
                :color="isSensitive(scope) ? 'error' : undefined"
                :prepend-icon="isSensitive(scope) ? mdiAlertOutline : undefined"
              >
                {{ scope }}
              </v-chip>
            </div>
          </v-card-text>

          <v-divider />
          <v-card-actions v-if="req.Status === 'pending'">
            <v-spacer />
            <v-btn
              variant="text"
              color="error"
              size="small"
              :prepend-icon="mdiCloseCircleOutline"
              @click="decide(req, false)"
              >Ablehnen</v-btn
            >
            <v-btn
              variant="flat"
              color="primary"
              size="small"
              :prepend-icon="mdiCheckCircleOutline"
              @click="decide(req, true)"
              >Genehmigen</v-btn
            >
          </v-card-actions>
          <v-card-actions v-else>
            <span class="text-caption text-medium-emphasis px-2"
              >Bearbeitet</span
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <h2 class="text-h6 font-weight-bold mt-8 mb-3 d-flex align-center ga-2">
      <v-icon :icon="mdiShieldKeyOutline" />
      Keycloak-Umgebungen
    </h2>

    <v-row>
      <v-col
        v-for="env in ssoEnvs"
        :key="env.name"
        cols="12"
        sm="6"
        lg="3"
      >
        <v-card
          border
          flat
          class="h-100"
        >
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <v-avatar
                :color="envColor(env.name)"
                variant="tonal"
                rounded="lg"
              >
                <v-icon :icon="mdiServerSecurity" />
              </v-avatar>
              <v-chip
                size="x-small"
                label
                variant="tonal"
                :color="envColor(env.name)"
                >{{ env.name }}</v-chip
              >
            </div>
            <div class="text-subtitle-1 font-weight-bold">
              {{ env.display_name }}
            </div>
            <div class="text-caption text-medium-emphasis mb-3">
              Realm: <code>{{ env.realm_name }}</code>
            </div>
            <v-btn
              :href="env.directory_link"
              target="_blank"
              rel="noopener noreferrer"
              variant="tonal"
              size="small"
              block
              :append-icon="mdiOpenInNew"
            >
              Admin-Konsole
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import {
  mdiAlertOutline,
  mdiApplicationBracesOutline,
  mdiCheckCircleOutline,
  mdiCloseCircleOutline,
  mdiKeyChainVariant,
  mdiMicrosoftAzure,
  mdiOpenInNew,
  mdiServerSecurity,
  mdiShieldKeyOutline,
} from "@mdi/js";
import { computed, onMounted, ref } from "vue";

import DataField from "@/components/common/DataField.vue";
import PageHeader from "@/components/common/PageHeader.vue";
import StatusChip from "@/components/common/StatusChip.vue";
import { STATUS_INDICATORS } from "@/constants";
import { mockApi } from "@/mock/api";
import { useSnackbarStore } from "@/stores/snackbar";
import { type AppConsentRequest, type SsoEnv } from "@/types/domain";
import { consentStatusIndicator, formatDateTime } from "@/util/display";

const snackbar = useSnackbarStore();
const loading = ref(true);
const consentRequests = ref<AppConsentRequest[]>([]);
const ssoEnvs = ref<SsoEnv[]>([]);

const SENSITIVE = [
  "User.ReadWrite.All",
  "Directory.Read.All",
  "Mail.Read",
  "Files.ReadWrite.All",
];

onMounted(async () => {
  const [reqs, envs] = await Promise.all([
    mockApi.consentRequests(),
    mockApi.ssoEnvs(),
  ]);
  consentRequests.value = reqs;
  ssoEnvs.value = envs;
  loading.value = false;
});

const pendingCount = computed(
  () => consentRequests.value.filter((r) => r.Status === "pending").length
);

function isSensitive(scope: string): boolean {
  return SENSITIVE.includes(scope);
}

function envColor(name: string): string {
  switch (name) {
    case "prod":
      return "error";
    case "test":
      return "warning";
    case "entwicklung":
      return "info";
    default:
      return "accent";
  }
}

function decide(req: AppConsentRequest, approve: boolean): void {
  req.Status = approve ? "approved" : "rejected";
  snackbar.push({
    text: `Freigabe für „${req.AppDisplayName}“ ${
      approve ? "genehmigt" : "abgelehnt"
    }.`,
    color: approve ? STATUS_INDICATORS.SUCCESS : STATUS_INDICATORS.WARNING,
  });
}
</script>
