<template>
  <div>
    <page-header
      eyebrow="Starke Authentisierung"
      title="Sicherheits-Token"
      subtitle="YubiKeys, Passkeys, Duo Mobile sowie Einmal-PIN und Tagespass je Person verwalten."
      :icon="mdiUsbFlashDrive"
    />

    <v-row>
      <!-- Search column -->
      <v-col
        cols="12"
        md="4"
        lg="3"
      >
        <person-search
          :results="results"
          :loading="searching"
          :selected="selectedUsername"
          @search="onSearch"
          @select="selectPerson"
        />

        <p class="text-overline text-medium-emphasis mt-5 mb-1 px-1">
          Schnellzugriff
        </p>
        <v-list
          nav
          density="comfortable"
          class="bg-transparent px-0"
        >
          <v-list-item
            v-for="p in quickList"
            :key="p.username"
            :active="p.username === selectedUsername"
            rounded="lg"
            border
            class="mb-2"
            @click="selectPerson(p.username)"
          >
            <template #prepend>
              <v-avatar
                color="primary"
                size="36"
                class="text-caption font-weight-bold"
              >
                {{ initials(p.ldap.cn) }}
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2 font-weight-medium">{{
              p.ldap.cn
            }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption">{{
              p.ldap.ou
            }}</v-list-item-subtitle>
            <template #append>
              <v-chip
                size="x-small"
                variant="tonal"
                label
                >{{ p.token.length }}</v-chip
              >
            </template>
          </v-list-item>
        </v-list>
      </v-col>

      <!-- Detail column -->
      <v-col
        cols="12"
        md="8"
        lg="9"
      >
        <div
          v-if="loadingPerson"
          class="d-flex flex-column ga-4"
        >
          <v-skeleton-loader type="article" />
          <v-skeleton-loader type="image, list-item-two-line" />
        </div>

        <v-card
          v-else-if="!person"
          border
          flat
        >
          <empty-state
            :icon="mdiAccountSearch"
            title="Keine Person ausgewählt"
            text="Suchen Sie nach einer Person oder wählen Sie einen Eintrag aus dem Schnellzugriff, um Token und Zugriffe einzusehen."
          />
        </v-card>

        <template v-else>
          <person-identity-card
            :person="person"
            class="mb-4"
          />

          <!-- Action toolbar -->
          <v-card
            border
            flat
            class="mb-4"
          >
            <v-card-text class="d-flex ga-2 flex-wrap pa-3">
              <v-btn
                :prepend-icon="mdiKeyPlus"
                color="primary"
                variant="flat"
                size="small"
                @click="
                  act('EinmalPIN wurde erstellt und kann zugestellt werden.')
                "
                >Einmal-PIN</v-btn
              >
              <v-btn
                :prepend-icon="mdiTicketConfirmationOutline"
                variant="tonal"
                size="small"
                @click="act('Tagespass wurde für heute vergeben.')"
                >Tagespass</v-btn
              >
              <v-btn
                :prepend-icon="mdiAccountSync"
                variant="tonal"
                size="small"
                @click="act('Person wurde im Token-Backend enrollt.')"
                >Enrollen</v-btn
              >
              <v-btn
                :prepend-icon="mdiLockOpenVariantOutline"
                variant="tonal"
                size="small"
                @click="act('Person wurde in allen Backends entsperrt.')"
                >Entsperren</v-btn
              >
              <v-spacer />
              <v-btn
                :prepend-icon="mdiAccountOff"
                color="error"
                variant="text"
                size="small"
                @click="act('Person wurde unenrollt.')"
                >Unenrollen</v-btn
              >
            </v-card-text>
          </v-card>

          <!-- Quick stats -->
          <v-row>
            <v-col
              cols="6"
              md="3"
            >
              <stat-card
                label="Token"
                :value="person.token.length"
                :icon="mdiKeyChainVariant"
                color="primary"
              />
            </v-col>
            <v-col
              cols="6"
              md="3"
            >
              <v-card
                border
                flat
                class="h-100"
              >
                <v-card-text class="pa-4">
                  <div class="text-caption text-medium-emphasis mb-2">
                    Duo-Status
                  </div>
                  <status-chip
                    :indicator="
                      person.duo
                        ? duoStatusIndicator(person.duo.status)
                        : { color: 'grey', label: 'Nicht in Duo' }
                    "
                    dot
                  />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col
              cols="6"
              md="3"
            >
              <v-card
                border
                flat
                class="h-100"
              >
                <v-card-text class="pa-4">
                  <div class="text-caption text-medium-emphasis mb-2">
                    VPSX-Sync
                  </div>
                  <status-chip :indicator="vpsxIndicator(person.vpsx_sync)" />
                </v-card-text>
              </v-card>
            </v-col>
            <v-col
              cols="6"
              md="3"
            >
              <stat-card
                label="Zugriffe"
                :value="accessCount"
                :icon="mdiLockCheckOutline"
                color="accent"
              />
            </v-col>
          </v-row>

          <!-- Tabs -->
          <v-card
            border
            flat
            class="mt-4"
          >
            <v-tabs
              v-model="tab"
              color="primary"
              class="border-b"
            >
              <v-tab value="tokens">Token ({{ person.token.length }})</v-tab>
              <v-tab value="access">Zugriffe &amp; Duo</v-tab>
              <v-tab value="logs"
                >Auth-Protokoll ({{ person.authlogs.length }})</v-tab
              >
            </v-tabs>

            <v-tabs-window v-model="tab">
              <!-- Tokens -->
              <v-tabs-window-item value="tokens">
                <v-card-text>
                  <v-row v-if="person.token.length">
                    <v-col
                      v-for="t in person.token"
                      :key="t.id"
                      cols="12"
                      sm="6"
                    >
                      <token-card
                        :token="t"
                        @action="onTokenAction"
                      />
                    </v-col>
                  </v-row>
                  <empty-state
                    v-else
                    :icon="mdiKeyAlertOutline"
                    title="Keine Token vorhanden"
                    text="Diese Person besitzt aktuell keine registrierten Faktoren."
                  />
                </v-card-text>
              </v-tabs-window-item>

              <!-- Access & Duo -->
              <v-tabs-window-item value="access">
                <v-card-text>
                  <h3 class="text-subtitle-2 font-weight-bold mb-3">
                    Berechtigungen (Access)
                  </h3>
                  <div
                    v-if="accessCount"
                    class="d-flex flex-column ga-3 mb-6"
                  >
                    <div
                      v-for="(perms, backend) in person.access"
                      :key="backend"
                    >
                      <div class="text-caption text-medium-emphasis mb-1">
                        {{ backend }}
                      </div>
                      <div class="d-flex ga-2 flex-wrap">
                        <v-chip
                          v-for="perm in perms"
                          :key="perm"
                          color="primary"
                          variant="tonal"
                          label
                          :prepend-icon="mdiLockCheckOutline"
                        >
                          {{ permissionLabel(perm) }}
                        </v-chip>
                      </div>
                    </div>
                  </div>
                  <v-alert
                    v-else
                    type="info"
                    variant="tonal"
                    density="comfortable"
                    text="Für diese Person sind keine Zugriffe hinterlegt."
                    class="mb-6"
                  />

                  <h3 class="text-subtitle-2 font-weight-bold mb-3">
                    Duo Security
                  </h3>
                  <dl
                    v-if="person.duo"
                    class="duo-grid"
                  >
                    <data-field label="Status">
                      <status-chip
                        :indicator="duoStatusIndicator(person.duo.status)"
                      />
                    </data-field>
                    <data-field
                      label="Enrollt"
                      :value="person.duo.is_enrolled ? 'Ja' : 'Nein'"
                    />
                    <data-field
                      label="Letzte Anmeldung"
                      :value="formatDateTime(person.duo.last_login)"
                    />
                    <data-field
                      label="E-Mail"
                      :value="person.duo.email"
                    />
                  </dl>
                  <p
                    v-else
                    class="text-body-2 text-medium-emphasis"
                  >
                    Kein Duo-Eintrag vorhanden.
                  </p>
                </v-card-text>
              </v-tabs-window-item>

              <!-- Logs -->
              <v-tabs-window-item value="logs">
                <v-card-text>
                  <v-table density="comfortable">
                    <thead>
                      <tr>
                        <th class="text-left">Zeitpunkt</th>
                        <th class="text-left">Anwendung</th>
                        <th class="text-left d-none d-sm-table-cell">Faktor</th>
                        <th class="text-left">Backend</th>
                        <th class="text-left">Ergebnis</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(log, i) in person.authlogs"
                        :key="i"
                      >
                        <td class="text-no-wrap">
                          {{ formatDateTime(log.timestamp) }}
                        </td>
                        <td>{{ log.application_name }}</td>
                        <td class="d-none d-sm-table-cell text-caption">
                          {{ log.factor }}
                        </td>
                        <td>
                          <v-chip
                            size="x-small"
                            variant="tonal"
                            label
                            >{{ log.backend }}</v-chip
                          >
                        </td>
                        <td>
                          <status-chip
                            :indicator="authResultIndicator(log.result)"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </v-table>
                </v-card-text>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import {
  mdiAccountOff,
  mdiAccountSearch,
  mdiAccountSync,
  mdiKeyAlertOutline,
  mdiKeyChainVariant,
  mdiKeyPlus,
  mdiLockCheckOutline,
  mdiLockOpenVariantOutline,
  mdiTicketConfirmationOutline,
  mdiUsbFlashDrive,
} from "@mdi/js";
import { computed, onMounted, ref } from "vue";

import DataField from "@/components/common/DataField.vue";
import EmptyState from "@/components/common/EmptyState.vue";
import PageHeader from "@/components/common/PageHeader.vue";
import PersonIdentityCard from "@/components/common/PersonIdentityCard.vue";
import PersonSearch from "@/components/common/PersonSearch.vue";
import StatCard from "@/components/common/StatCard.vue";
import StatusChip from "@/components/common/StatusChip.vue";
import TokenCard from "@/components/token/TokenCard.vue";
import { STATUS_INDICATORS } from "@/constants";
import { mockApi } from "@/mock/api";
import { useSnackbarStore } from "@/stores/snackbar";
import {
  type AnyToken,
  type TokenPermission,
  type TokenPerson,
} from "@/types/domain";
import {
  authResultIndicator,
  duoStatusIndicator,
  formatDateTime,
  initials,
  TOKEN_PERMISSION_LABEL,
  vpsxIndicator,
} from "@/util/display";

const snackbar = useSnackbarStore();

const results = ref<TokenPerson[]>([]);
const quickList = ref<TokenPerson[]>([]);
const searching = ref(false);
const loadingPerson = ref(false);
const person = ref<TokenPerson>();
const selectedUsername = ref("");
const tab = ref("tokens");

onMounted(async () => {
  quickList.value = await mockApi.listTokenPeople();
});

async function onSearch(query: string): Promise<void> {
  searching.value = true;
  results.value = query ? await mockApi.searchTokenPeople(query) : [];
  searching.value = false;
}

async function selectPerson(username: string): Promise<void> {
  selectedUsername.value = username;
  loadingPerson.value = true;
  tab.value = "tokens";
  person.value = await mockApi.getTokenPerson(username);
  loadingPerson.value = false;
}

const accessCount = computed(() =>
  Object.values(person.value?.access ?? {}).reduce(
    (sum, perms) => sum + perms.length,
    0
  )
);

function permissionLabel(perm: TokenPermission): string {
  return TOKEN_PERMISSION_LABEL[perm] ?? perm;
}

function act(message: string): void {
  snackbar.push({ text: message, color: STATUS_INDICATORS.SUCCESS });
}

function onTokenAction(token: AnyToken): void {
  snackbar.push({
    text: `Aktionen für Token ${token.id} (${token.kind}) – Demo.`,
  });
}
</script>

<style scoped>
.duo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
</style>
