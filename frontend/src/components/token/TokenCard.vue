<template>
  <v-card
    border
    flat
    class="h-100"
  >
    <v-card-text class="pa-4">
      <div class="d-flex align-center ga-3 mb-3">
        <v-avatar
          :color="meta.color"
          variant="tonal"
          rounded="lg"
          size="42"
        >
          <v-icon :icon="meta.icon" />
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-subtitle-2 font-weight-bold">{{ meta.label }}</div>
          <v-chip
            size="x-small"
            variant="tonal"
            label
            :color="token.backend === 'DUO' ? 'info' : 'accent'"
          >
            {{ token.backend }}
          </v-chip>
        </div>
        <v-btn
          :icon="mdiDotsVertical"
          variant="text"
          size="small"
          density="comfortable"
          aria-label="Token-Aktionen"
          @click="emit('action', token)"
        />
      </div>

      <dl class="token-grid">
        <template v-if="yubikey">
          <data-field
            label="Seriennummer"
            :value="yubikey.serial"
          />
          <data-field
            label="Modell"
            :value="`YubiKey ${yubikey.yk_type ?? ''}`"
          />
          <data-field
            label="NFC-ID"
            :value="yubikey.nfcid ?? 'kein NFC'"
          />
        </template>

        <template v-else-if="webauthn">
          <data-field
            label="Bezeichnung"
            :value="webauthn.credential_name"
          />
          <data-field
            label="Typ"
            :value="
              webauthn.registered_as === 'platform'
                ? 'Plattform-Authenticator'
                : 'Roaming-Authenticator'
            "
          />
          <data-field
            label="Hinzugefügt"
            :value="formatDate(webauthn.date_added)"
          />
          <data-field
            label="Zuletzt genutzt"
            :value="formatDateTime(webauthn.date_last_used)"
          />
        </template>

        <template v-else-if="push">
          <data-field
            label="Gerät"
            :value="push.model"
          />
          <data-field
            label="Betriebssystem"
            :value="push.os_version"
          />
          <data-field
            label="App-Version"
            :value="push.app_version"
          />
          <data-field label="Status">
            <status-chip
              :indicator="
                push.activated
                  ? { color: 'success', label: 'Aktiviert' }
                  : { color: 'grey', label: 'Inaktiv' }
              "
            />
          </data-field>
        </template>

        <template v-else-if="otp">
          <data-field label="Wert">
            <code>{{ otp.value ?? "•••••••••" }}</code>
          </data-field>
          <data-field
            label="Erstellt"
            :value="formatDateTime(otp.created)"
          />
          <data-field
            label="Gültig bis"
            :value="formatDateTime(otp.expiration)"
          />
          <data-field
            label="Verbleibende Nutzungen"
            :value="otp.reuse_count"
          />
        </template>
      </dl>

      <div
        v-if="webauthn?.transports?.length"
        class="mt-3 d-flex ga-1 flex-wrap"
      >
        <v-chip
          v-for="tr in webauthn.transports"
          :key="tr"
          size="x-small"
          variant="outlined"
          label
        >
          {{ tr }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type {
  AnyToken,
  OtpToken,
  PushTokenT,
  WebauthnToken,
  Yubikey,
} from "@/types/domain";

import { mdiDotsVertical } from "@mdi/js";
import { computed } from "vue";

import DataField from "@/components/common/DataField.vue";
import StatusChip from "@/components/common/StatusChip.vue";
import { formatDate, formatDateTime, TOKEN_KIND_META } from "@/util/display";

const props = defineProps<{
  token: AnyToken;
}>();

const emit = defineEmits<{
  action: [token: AnyToken];
}>();

const meta = computed(() => TOKEN_KIND_META[props.token.kind]);

// Discriminated-union guards so the template narrows reliably.
const yubikey = computed(() =>
  props.token.kind === "Yubikey" ? (props.token as Yubikey) : null
);
const webauthn = computed(() =>
  props.token.kind === "FullWebauthncredential" ||
  props.token.kind === "Webauthncredential"
    ? (props.token as WebauthnToken)
    : null
);
const push = computed(() =>
  props.token.kind === "PushToken" ? (props.token as PushTokenT) : null
);
const otp = computed(() =>
  props.token.kind === "EinmalPin" || props.token.kind === "Tagespass"
    ? (props.token as OtpToken)
    : null
);
</script>

<style scoped>
.token-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 16px;
}
code {
  font-size: 0.85em;
}
</style>
