<template>
  <div>
    <page-header
      eyebrow="Fortgeschrittene elektronische Signatur"
      title="Elektronische Signatur (FES)"
      subtitle="Signaturberechtigungen, RA-Admin-Rollen, Signaturzertifikate und SecSigner-Installationen verwalten."
      :icon="mdiFileSign"
    />

    <v-row>
      <v-col
        cols="12"
        md="4"
        lg="3"
      >
        <person-search
          :results="results"
          :loading="searching"
          :selected="selectedUsername"
          label="FES-Person suchen"
          @search="onSearch"
          @select="selectPerson"
        />

        <section-card
          title="FES-Bestand"
          :icon="mdiChartBox"
          class="mt-4"
        >
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2">Berechtigte gesamt</span>
            <span class="font-weight-bold">{{ enabledCount }}</span>
          </div>
          <div class="d-flex justify-space-between mb-2">
            <span class="text-body-2">davon RA-Admins</span>
            <span class="font-weight-bold">{{ raAdminCount }}</span>
          </div>
          <div class="d-flex justify-space-between">
            <span class="text-body-2">Aktive Signaturzertifikate</span>
            <span class="font-weight-bold">{{ certCount }}</span>
          </div>
        </section-card>
      </v-col>

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
          <v-skeleton-loader type="table" />
        </div>

        <!-- Default: overview table of all enabled users -->
        <section-card
          v-else-if="!person"
          title="Alle FES-Berechtigten"
          subtitle="Übersicht der signaturberechtigten Personen"
          :icon="mdiAccountMultipleCheckOutline"
          :divider="true"
        >
          <v-data-table
            :headers="overviewHeaders"
            :items="enabledPeople"
            :items-per-page="10"
            density="comfortable"
            hover
            @click:row="
              (_: unknown, ctx: { item: FesPerson }) =>
                selectPerson(ctx.item.username)
            "
          >
            <template #[`item.name`]="{ item }">
              <div class="d-flex align-center ga-3 py-1">
                <v-avatar
                  color="primary"
                  size="34"
                  class="text-caption font-weight-bold"
                  >{{ initials(item.ldap.cn) }}</v-avatar
                >
                <div>
                  <div class="font-weight-medium">{{ item.ldap.cn }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ item.username }}
                  </div>
                </div>
              </div>
            </template>
            <template #[`item.ou`]="{ item }">
              <v-chip
                size="small"
                variant="tonal"
                label
                >{{ item.ldap.ou }}</v-chip
              >
            </template>
            <template #[`item.is_ra_admin`]="{ item }">
              <status-chip
                v-if="item.is_ra_admin"
                :indicator="{ color: 'accent', label: 'RA-Admin' }"
              />
              <span
                v-else
                class="text-medium-emphasis"
                >—</span
              >
            </template>
            <template #[`item.signing_certs`]="{ item }">
              {{ item.signing_certs.length }}
            </template>
            <template #[`item.actions`]>
              <v-icon
                :icon="mdiChevronRight"
                class="text-medium-emphasis"
              />
            </template>
          </v-data-table>
        </section-card>

        <template v-else>
          <person-identity-card
            :person="person"
            class="mb-4"
          />

          <!-- FES status + actions -->
          <v-card
            border
            flat
            class="mb-4"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center ga-3 flex-wrap mb-4">
                <status-chip
                  :indicator="
                    person.is_enabled
                      ? { color: 'success', label: 'FES aktiviert' }
                      : { color: 'grey', label: 'FES nicht aktiv' }
                  "
                  dot
                />
                <status-chip
                  v-if="person.is_ra_admin"
                  :indicator="{ color: 'accent', label: 'RA-Admin' }"
                />
                <v-spacer />
                <v-btn
                  v-if="!person.is_enabled"
                  color="primary"
                  variant="flat"
                  size="small"
                  :prepend-icon="mdiCheckCircleOutline"
                  @click="act('FES wurde für die Person aktiviert.')"
                  >Aktivieren</v-btn
                >
                <v-btn
                  v-else
                  color="error"
                  variant="text"
                  size="small"
                  :prepend-icon="mdiCloseCircleOutline"
                  @click="act('FES wurde deaktiviert.')"
                  >Deaktivieren</v-btn
                >
                <v-btn
                  variant="tonal"
                  size="small"
                  :prepend-icon="mdiShieldAccountOutline"
                  @click="act('RA-Admin-Recht umgeschaltet.')"
                  >RA-Admin</v-btn
                >
                <v-btn
                  variant="tonal"
                  size="small"
                  color="error"
                  :prepend-icon="mdiCertificateOutline"
                  @click="
                    act('Alle Signaturzertifikate wurden gesperrt (revoke).')
                  "
                  >Revoke</v-btn
                >
              </div>

              <v-row>
                <v-col
                  cols="6"
                  md="3"
                >
                  <stat-card
                    label="Signaturzertifikate"
                    :value="person.signing_certs.length"
                    :icon="mdiCertificateOutline"
                    color="primary"
                  />
                </v-col>
                <v-col
                  cols="6"
                  md="3"
                >
                  <stat-card
                    label="RA-Zertifikate"
                    :value="person.ra_enrollment_certs.length"
                    :icon="mdiCardAccountDetailsOutline"
                    color="accent"
                  />
                </v-col>
                <v-col
                  cols="6"
                  md="3"
                >
                  <stat-card
                    label="Installationen"
                    :value="person.software_installs.length"
                    :icon="mdiLaptop"
                    color="info"
                  />
                </v-col>
                <v-col
                  cols="6"
                  md="3"
                >
                  <stat-card
                    label="Clients"
                    :value="person.computers.length"
                    :icon="mdiDesktopClassic"
                    color="primary"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <section-card
            title="Signaturzertifikate"
            :icon="mdiCertificateOutline"
            class="mb-4"
          >
            <v-table
              v-if="person.signing_certs.length"
              density="comfortable"
            >
              <thead>
                <tr>
                  <th class="text-left">Common Name</th>
                  <th class="text-left">Seriennummer</th>
                  <th class="text-left d-none d-md-table-cell">Template</th>
                  <th class="text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="cert in person.signing_certs"
                  :key="cert.serial"
                >
                  <td class="font-weight-medium">{{ cert.cn }}</td>
                  <td>
                    <code>{{ cert.serial }}</code>
                  </td>
                  <td class="d-none d-md-table-cell text-caption">
                    {{ cert.cert_template }}
                  </td>
                  <td>
                    <status-chip
                      :indicator="dispositionIndicator(cert.disposition)"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
            <empty-state
              v-else
              :icon="mdiCertificateOutline"
              title="Keine Signaturzertifikate"
            />
          </section-card>

          <section-card
            title="SecSigner-Installationen & Clients"
            :icon="mdiLaptop"
          >
            <v-table
              v-if="person.software_installs.length"
              density="comfortable"
            >
              <thead>
                <tr>
                  <th class="text-left">Produkt</th>
                  <th class="text-left">Version</th>
                  <th class="text-left">Client</th>
                  <th class="text-left">Letzter Heartbeat</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(sw, i) in person.software_installs"
                  :key="i"
                >
                  <td class="font-weight-medium">{{ sw.product }}</td>
                  <td>
                    <span class="d-flex align-center ga-2">
                      {{ sw.version }}
                      <v-tooltip
                        v-if="sw.version !== sw.up_to_date_version"
                        text="Update verfügbar"
                      >
                        <template #activator="{ props }">
                          <v-icon
                            v-bind="props"
                            :icon="mdiAlertOutline"
                            color="warning"
                            size="16"
                          />
                        </template>
                      </v-tooltip>
                    </span>
                  </td>
                  <td>
                    <code>{{ sw.client }}</code>
                  </td>
                  <td>{{ formatDateTime(sw.last_heartbeat) }}</td>
                </tr>
              </tbody>
            </v-table>
            <empty-state
              v-else
              :icon="mdiLaptop"
              title="Keine Installationen erfasst"
            />
            <div
              v-if="person.computers.length"
              class="mt-4 d-flex ga-2 flex-wrap"
            >
              <v-chip
                v-for="c in person.computers"
                :key="c"
                size="small"
                variant="outlined"
                label
                :prepend-icon="mdiDesktopClassic"
                >{{ c }}</v-chip
              >
            </div>
          </section-card>
        </template>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import {
  mdiAccountMultipleCheckOutline,
  mdiAlertOutline,
  mdiCardAccountDetailsOutline,
  mdiCertificateOutline,
  mdiChartBox,
  mdiCheckCircleOutline,
  mdiChevronRight,
  mdiCloseCircleOutline,
  mdiDesktopClassic,
  mdiFileSign,
  mdiLaptop,
  mdiShieldAccountOutline,
} from "@mdi/js";
import { computed, onMounted, ref } from "vue";

import EmptyState from "@/components/common/EmptyState.vue";
import PageHeader from "@/components/common/PageHeader.vue";
import PersonIdentityCard from "@/components/common/PersonIdentityCard.vue";
import PersonSearch from "@/components/common/PersonSearch.vue";
import SectionCard from "@/components/common/SectionCard.vue";
import StatCard from "@/components/common/StatCard.vue";
import StatusChip from "@/components/common/StatusChip.vue";
import { STATUS_INDICATORS } from "@/constants";
import { mockApi } from "@/mock/api";
import { useSnackbarStore } from "@/stores/snackbar";
import { type FesPerson } from "@/types/domain";
import { dispositionIndicator, formatDateTime, initials } from "@/util/display";

const snackbar = useSnackbarStore();

const results = ref<FesPerson[]>([]);
const enabledPeople = ref<FesPerson[]>([]);
const searching = ref(false);
const loadingPerson = ref(false);
const person = ref<FesPerson>();
const selectedUsername = ref("");

const overviewHeaders = [
  { title: "Person", key: "name", sortable: false },
  { title: "Referat", key: "ou" },
  { title: "Rolle", key: "is_ra_admin", sortable: false },
  { title: "Zertifikate", key: "signing_certs", align: "end" as const },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

onMounted(async () => {
  enabledPeople.value = await mockApi.listFesEnabled();
});

async function onSearch(query: string): Promise<void> {
  searching.value = true;
  results.value = query ? await mockApi.searchFesPeople(query) : [];
  searching.value = false;
}

async function selectPerson(username: string): Promise<void> {
  selectedUsername.value = username;
  loadingPerson.value = true;
  person.value = await mockApi.getFesPerson(username);
  loadingPerson.value = false;
}

const enabledCount = computed(() => enabledPeople.value.length);
const raAdminCount = computed(
  () => enabledPeople.value.filter((p) => p.is_ra_admin).length
);
const certCount = computed(() =>
  enabledPeople.value.reduce(
    (sum, p) =>
      sum + p.signing_certs.filter((c) => c.disposition === 20).length,
    0
  )
);

function act(message: string): void {
  snackbar.push({ text: message, color: STATUS_INDICATORS.SUCCESS });
}
</script>
