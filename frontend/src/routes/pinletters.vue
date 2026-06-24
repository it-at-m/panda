<template>
  <div>
    <page-header
      eyebrow="Token-Zustellung"
      title="PIN-Briefe"
      subtitle="Spooler für PIN-Anschreiben – Druckläufe erfolgen dienstags und donnerstags um 06:00 Uhr."
      :icon="mdiEmailFastOutline"
    >
      <template #actions>
        <v-btn
          color="primary"
          variant="flat"
          :prepend-icon="mdiPlus"
          @click="dialog = true"
        >
          Neuer PIN-Brief
        </v-btn>
      </template>
    </page-header>

    <v-row class="mb-1">
      <v-col
        cols="12"
        sm="4"
      >
        <stat-card
          label="Im Spooler"
          :value="letters.length"
          :icon="mdiTrayFull"
          color="primary"
        />
      </v-col>
      <v-col
        cols="12"
        sm="4"
      >
        <stat-card
          label="Neuausstellungen"
          :value="newCount"
          :icon="mdiEmailPlusOutline"
          color="success"
        />
      </v-col>
      <v-col
        cols="12"
        sm="4"
      >
        <stat-card
          label="Nächster Druck"
          :value="nextPrintDay"
          :icon="mdiPrinterOutline"
          color="accent"
        />
      </v-col>
    </v-row>

    <v-alert
      type="info"
      variant="tonal"
      density="comfortable"
      class="mb-4"
      :icon="mdiInformationOutline"
      text="Briefe können bis zum nächsten Drucklauf storniert werden. Danach werden sie an die hinterlegte Dienstanschrift versendet."
    />

    <section-card
      title="Gespoolte Briefe"
      :icon="mdiEmailMultipleOutline"
    >
      <v-table
        v-if="letters.length"
        density="comfortable"
      >
        <thead>
          <tr>
            <th class="text-left">Empfänger</th>
            <th class="text-left d-none d-md-table-cell">Referat</th>
            <th class="text-left d-none d-sm-table-cell">Anschrift</th>
            <th class="text-left">Art</th>
            <th class="text-left">Eingestellt</th>
            <th class="text-right">Aktion</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="letter in letters"
            :key="letter.lhmObjectID"
          >
            <td>
              <div class="d-flex align-center ga-3 py-1">
                <v-avatar
                  color="primary"
                  size="34"
                  class="text-caption font-weight-bold"
                  >{{ initials(`${letter.givenName} ${letter.sn}`) }}</v-avatar
                >
                <div>
                  <div class="font-weight-medium">
                    {{ letter.givenName }} {{ letter.sn }}
                  </div>
                  <code class="text-caption text-medium-emphasis">{{
                    letter.lhmObjectID
                  }}</code>
                </div>
              </div>
            </td>
            <td class="d-none d-md-table-cell">
              <v-chip
                size="small"
                variant="tonal"
                label
                >{{ letter.ou }}</v-chip
              >
            </td>
            <td class="d-none d-sm-table-cell text-medium-emphasis">
              {{ letter.streetAddress }}, {{ letter.postalCode }} {{ letter.l }}
            </td>
            <td>
              <status-chip
                :indicator="
                  letter.mode === 'neu'
                    ? { color: 'success', label: 'Neu' }
                    : { color: 'info', label: 'Tausch' }
                "
              />
              <v-tooltip
                v-if="letter.externalMail"
                text="Versand an externe Adresse"
              >
                <template #activator="{ props }">
                  <v-icon
                    v-bind="props"
                    :icon="mdiEmailArrowRightOutline"
                    color="warning"
                    size="16"
                    class="ms-1"
                  />
                </template>
              </v-tooltip>
            </td>
            <td class="text-no-wrap">{{ relativeTime(letter.date) }}</td>
            <td class="text-right">
              <v-btn
                :prepend-icon="mdiCloseCircleOutline"
                variant="text"
                size="small"
                color="error"
                @click="cancel(letter)"
                >Stornieren</v-btn
              >
            </td>
          </tr>
        </tbody>
      </v-table>
      <empty-state
        v-else
        :icon="mdiEmailCheckOutline"
        title="Spooler ist leer"
        text="Aktuell sind keine PIN-Briefe zum Druck vorgemerkt."
      />
    </section-card>

    <!-- Create dialog -->
    <v-dialog
      v-model="dialog"
      max-width="640"
    >
      <v-card>
        <v-card-item>
          <template #prepend>
            <v-icon
              :icon="mdiEmailPlusOutline"
              color="primary"
            />
          </template>
          <v-card-title>Neuen PIN-Brief erstellen</v-card-title>
        </v-card-item>
        <v-divider />
        <v-card-text>
          <v-form
            ref="formRef"
            @submit.prevent="create"
          >
            <v-row>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="form.givenName"
                  label="Vorname"
                  :rules="[required]"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="form.sn"
                  label="Nachname"
                  :rules="[required]"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="form.lhmObjectID"
                  label="LHM-Objekt-ID"
                  :rules="[required]"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-text-field
                  v-model="form.ou"
                  label="Referat / OU"
                  :rules="[required]"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.streetAddress"
                  label="Straße und Hausnummer"
                  :rules="[required]"
                />
              </v-col>
              <v-col
                cols="12"
                sm="5"
              >
                <v-text-field
                  v-model="form.postalCode"
                  label="PLZ"
                  :rules="[required]"
                />
              </v-col>
              <v-col
                cols="12"
                sm="7"
              >
                <v-text-field
                  v-model="form.l"
                  label="Ort"
                  :rules="[required]"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
                <v-select
                  v-model="form.mode"
                  :items="modeItems"
                  label="Art des Briefs"
                />
              </v-col>
              <v-col
                cols="12"
                sm="6"
                class="d-flex align-center"
              >
                <v-switch
                  v-model="form.externalMail"
                  color="primary"
                  label="Externe Versandadresse"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="dialog = false"
            >Abbrechen</v-btn
          >
          <v-btn
            color="primary"
            variant="flat"
            :prepend-icon="mdiTrayArrowDown"
            @click="create"
            >In Spooler stellen</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import {
  mdiCloseCircleOutline,
  mdiEmailArrowRightOutline,
  mdiEmailCheckOutline,
  mdiEmailFastOutline,
  mdiEmailMultipleOutline,
  mdiEmailPlusOutline,
  mdiInformationOutline,
  mdiPlus,
  mdiPrinterOutline,
  mdiTrayArrowDown,
  mdiTrayFull,
} from "@mdi/js";
import { computed, onMounted, reactive, ref } from "vue";

import EmptyState from "@/components/common/EmptyState.vue";
import PageHeader from "@/components/common/PageHeader.vue";
import SectionCard from "@/components/common/SectionCard.vue";
import StatCard from "@/components/common/StatCard.vue";
import StatusChip from "@/components/common/StatusChip.vue";
import { STATUS_INDICATORS } from "@/constants";
import { mockApi } from "@/mock/api";
import { useSnackbarStore } from "@/stores/snackbar";
import { type PinLetter } from "@/types/domain";
import { initials, relativeTime } from "@/util/display";

const snackbar = useSnackbarStore();
const letters = ref<PinLetter[]>([]);
const dialog = ref(false);

const modeItems = [
  { title: "Neu (Erstausstellung)", value: "neu" },
  { title: "Tausch (Ersatz)", value: "tausch" },
];

const form = reactive<PinLetter>({
  lhmObjectID: "",
  givenName: "",
  sn: "",
  ou: "",
  streetAddress: "",
  postalCode: "",
  l: "München",
  mode: "neu",
  externalMail: false,
});

onMounted(async () => {
  letters.value = await mockApi.pinLetters();
});

const newCount = computed(
  () => letters.value.filter((l) => l.mode === "neu").length
);

const nextPrintDay = computed(() => {
  const day = new Date().getDay();
  // Druck Di (2) und Do (4)
  if (day < 2 || day === 3) return "Dienstag";
  if (day === 2 || day === 4) return "Donnerstag";
  return "Dienstag";
});

function required(v: string): boolean | string {
  return !!v || "Pflichtfeld";
}

function cancel(letter: PinLetter): void {
  letters.value = letters.value.filter(
    (l) => l.lhmObjectID !== letter.lhmObjectID
  );
  snackbar.push({
    text: `PIN-Brief für ${letter.givenName} ${letter.sn} wurde storniert.`,
    color: STATUS_INDICATORS.INFO,
  });
}

function create(): void {
  if (!form.givenName || !form.sn || !form.lhmObjectID) {
    snackbar.push({
      text: "Bitte alle Pflichtfelder ausfüllen.",
      color: STATUS_INDICATORS.WARNING,
    });
    return;
  }
  letters.value.unshift({
    ...form,
    date: new Date().toISOString(),
  });
  snackbar.push({
    text: `PIN-Brief für ${form.givenName} ${form.sn} wurde eingestellt.`,
    color: STATUS_INDICATORS.SUCCESS,
  });
  dialog.value = false;
  Object.assign(form, {
    lhmObjectID: "",
    givenName: "",
    sn: "",
    ou: "",
    streetAddress: "",
    postalCode: "",
    l: "München",
    mode: "neu",
    externalMail: false,
  });
}
</script>
