<template>
  <div>
    <page-header
      eyebrow="Public Key Infrastructure"
      title="Code Signing"
      subtitle="PowerShell-Skripte und -Module mit dem offiziellen Codesigning-Zertifikat der LHM signieren."
      :icon="mdiFileCertificateOutline"
    />

    <v-row>
      <v-col
        cols="12"
        md="5"
      >
        <section-card
          title="Skript signieren"
          subtitle="Erlaubt: .ps, .ps1, .pm"
          :icon="mdiDraw"
        >
          <v-file-input
            v-model="file"
            :prepend-icon="undefined"
            :prepend-inner-icon="mdiFileUploadOutline"
            variant="outlined"
            label="PowerShell-Datei auswählen"
            accept=".ps,.ps1,.pm,.psm1"
            show-size
            hide-details
            class="mb-4"
          />

          <v-expand-transition>
            <v-alert
              v-if="file && !isValid"
              type="error"
              variant="tonal"
              density="comfortable"
              class="mb-4"
              text="Ungültiger Dateityp. Bitte eine .ps-, .ps1- oder .pm-Datei wählen."
            />
          </v-expand-transition>

          <div
            class="d-flex align-center ga-3 pa-3 rounded-lg bg-surface-light mb-4"
          >
            <v-icon
              :icon="mdiCertificate"
              color="primary"
            />
            <div>
              <div class="text-body-2 font-weight-medium">
                LHM-CodeSigning-2026
              </div>
              <div class="text-caption text-medium-emphasis">
                Fingerabdruck 9F2C…A41B · gültig bis 31.12.2027
              </div>
            </div>
            <v-spacer />
            <status-chip
              :indicator="{ color: 'success', label: 'Gültig' }"
              dot
            />
          </div>

          <v-btn
            color="primary"
            variant="flat"
            block
            size="large"
            :prepend-icon="mdiShieldCheck"
            :disabled="!isValid"
            :loading="signing"
            @click="sign"
          >
            Jetzt signieren
          </v-btn>
        </section-card>
      </v-col>

      <v-col
        cols="12"
        md="7"
      >
        <section-card
          title="Zuletzt signiert"
          :icon="mdiHistory"
        >
          <template #append>
            <v-chip
              size="small"
              variant="tonal"
              label
              >{{ scripts.length }}</v-chip
            >
          </template>
          <v-table density="comfortable">
            <thead>
              <tr>
                <th class="text-left">Datei</th>
                <th class="text-left d-none d-sm-table-cell">Größe</th>
                <th class="text-left">Antragsteller</th>
                <th class="text-left">Zeitpunkt</th>
                <th class="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="s in scripts"
                :key="s.id"
              >
                <td>
                  <div class="d-flex align-center ga-2">
                    <v-icon
                      :icon="mdiScriptTextOutline"
                      size="18"
                      class="text-medium-emphasis"
                    />
                    <code>{{ s.filename }}</code>
                  </div>
                </td>
                <td class="d-none d-sm-table-cell text-medium-emphasis">
                  {{ s.size_kb }} KB
                </td>
                <td>{{ s.requester }}</td>
                <td class="text-no-wrap">{{ relativeTime(s.signed_at) }}</td>
                <td>
                  <status-chip
                    :indicator="
                      s.status === 'signed'
                        ? {
                            color: 'success',
                            label: 'Signiert',
                            icon: mdiCheck,
                          }
                        : { color: 'error', label: 'Fehler' }
                    "
                  />
                </td>
              </tr>
            </tbody>
          </v-table>
        </section-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import {
  mdiCertificate,
  mdiCheck,
  mdiDraw,
  mdiFileCertificateOutline,
  mdiFileUploadOutline,
  mdiHistory,
  mdiScriptTextOutline,
  mdiShieldCheck,
} from "@mdi/js";
import { computed, onMounted, ref } from "vue";

import PageHeader from "@/components/common/PageHeader.vue";
import SectionCard from "@/components/common/SectionCard.vue";
import StatusChip from "@/components/common/StatusChip.vue";
import { STATUS_INDICATORS } from "@/constants";
import { mockApi } from "@/mock/api";
import { useSnackbarStore } from "@/stores/snackbar";
import { type SignedScript } from "@/types/domain";
import { relativeTime } from "@/util/display";

const snackbar = useSnackbarStore();
const scripts = ref<SignedScript[]>([]);
const file = ref<File | File[] | null>(null);
const signing = ref(false);

onMounted(async () => {
  scripts.value = await mockApi.signedScripts();
});

const currentFile = computed<File | null>(() => {
  const f = file.value;
  if (!f) return null;
  return Array.isArray(f) ? (f[0] ?? null) : f;
});

const isValid = computed(() => {
  const name = currentFile.value?.name.toLowerCase() ?? "";
  return [".ps", ".ps1", ".pm", ".psm1"].some((ext) => name.endsWith(ext));
});

async function sign(): Promise<void> {
  const f = currentFile.value;
  if (!f || !isValid.value) return;
  signing.value = true;
  await new Promise((r) => setTimeout(r, 1200));
  scripts.value.unshift({
    id: `sig-${Date.now().toString()}`,
    filename: f.name.replace(/\.(ps1?|psm?1?|pm)$/i, ".sig.$1"),
    signed_at: new Date().toISOString(),
    requester: "anna.bauer",
    size_kb: Math.round((f.size / 1024) * 10) / 10,
    cert_thumbprint: "9F2C…A41B",
    status: "signed",
  });
  signing.value = false;
  file.value = null;
  snackbar.push({
    text: `„${f.name}“ wurde erfolgreich signiert.`,
    color: STATUS_INDICATORS.SUCCESS,
  });
}
</script>
