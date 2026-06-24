<template>
  <v-card
    border
    flat
  >
    <v-card-text class="pa-5">
      <div class="d-flex align-center ga-4 mb-4">
        <v-avatar
          color="primary"
          size="64"
          class="text-h5 font-weight-bold"
        >
          {{ initials(person.ldap.cn) }}
        </v-avatar>
        <div class="flex-grow-1">
          <div class="d-flex align-center ga-2 flex-wrap">
            <h2 class="text-h6 font-weight-bold mb-0">
              {{ person.ldap.title ? person.ldap.title + " " : ""
              }}{{ person.ldap.cn }}
            </h2>
          </div>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ person.ldap.lhmFunctionalTitle ?? person.ldap.employeeType }}
          </p>
          <code class="text-caption">{{ person.username }}</code>
        </div>
      </div>

      <div class="d-flex ga-2 flex-wrap mb-4">
        <v-chip
          size="small"
          variant="tonal"
          color="primary"
          label
          :prepend-icon="mdiOfficeBuildingOutline"
        >
          {{ person.ldap.ou }}
        </v-chip>
        <status-chip
          v-if="person.ad_is_disabled"
          :indicator="{ color: 'error', label: 'AD deaktiviert' }"
        />
        <status-chip
          v-if="person.ad_is_locked"
          :indicator="{ color: 'warning', label: 'AD gesperrt' }"
        />
        <status-chip
          v-if="!person.ad_is_disabled && !person.ad_is_locked"
          :indicator="{ color: 'success', label: 'Konto aktiv' }"
          dot
        />
        <v-chip
          v-if="person.is_pzi"
          size="small"
          variant="tonal"
          color="accent"
          label
        >
          PZI
        </v-chip>
      </div>

      <v-divider class="mb-4" />

      <dl class="identity-grid">
        <data-field
          label="LHM-Objekt-ID"
          :value="person.lhmObjectID"
        />
        <data-field
          label="Organisationseinheit"
          :value="person.ldap.lhmOULongname"
        />
        <data-field label="E-Mail">
          <a
            v-if="person.mail"
            :href="`mailto:${person.mail}`"
            class="text-decoration-none text-primary"
            >{{ person.mail }}</a
          >
          <span v-else>—</span>
        </data-field>
        <data-field
          label="Telefon"
          :value="person.ldap.telephoneNumber"
        />
        <data-field
          label="Mobil"
          :value="person.ldap.mobile"
        />
        <data-field
          label="Raum / Anschrift"
          :value="`${person.ldap.roomNumber ?? ''} · ${person.ldap.street ?? ''}`"
        />
      </dl>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { PersonCore } from "@/types/domain";

import { mdiOfficeBuildingOutline } from "@mdi/js";

import DataField from "@/components/common/DataField.vue";
import StatusChip from "@/components/common/StatusChip.vue";
import { initials } from "@/util/display";

defineProps<{
  person: PersonCore;
}>();
</script>

<style scoped>
.identity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
</style>
