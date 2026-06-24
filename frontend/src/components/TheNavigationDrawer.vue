<template>
  <v-navigation-drawer
    v-model="showDrawer"
    :permanent="isDesktop"
    :temporary="!isDesktop"
    width="284"
    color="surface"
  >
    <div class="pa-4 d-flex align-center ga-3">
      <v-avatar
        color="primary"
        rounded="lg"
        size="40"
      >
        <v-icon
          :icon="mdiPawOutline"
          color="secondary"
        />
      </v-avatar>
      <div>
        <div class="text-subtitle-1 font-weight-bold lh-1">
          <span>{{ t("app.name.part1") }}</span
          ><span class="text-medium-emphasis">{{ t("app.name.part2") }}</span>
        </div>
        <div class="text-caption text-medium-emphasis">it@M · Panda 3</div>
      </div>
    </div>

    <v-divider />

    <v-list
      nav
      density="comfortable"
      class="px-2"
      aria-label="Hauptnavigation"
    >
      <v-list-item
        :prepend-icon="mdiViewDashboardOutline"
        :title="t('nav.dashboard')"
        to="/"
        exact
        rounded="lg"
      />

      <v-list-subheader>{{ t("nav.sections.operations") }}</v-list-subheader>
      <v-list-item
        :prepend-icon="mdiUsbFlashDrive"
        :title="t('nav.token')"
        to="/token"
        rounded="lg"
      />
      <v-list-item
        :prepend-icon="mdiFileSign"
        :title="t('nav.fes')"
        to="/fes"
        rounded="lg"
      />
      <v-list-item
        :prepend-icon="mdiEmailFastOutline"
        :title="t('nav.pinletters')"
        to="/pinletters"
        rounded="lg"
      />

      <v-list-subheader>{{
        t("nav.sections.administration")
      }}</v-list-subheader>
      <v-list-item
        :prepend-icon="mdiClockOutline"
        :title="t('nav.cron')"
        to="/cron"
        rounded="lg"
      >
        <template #append>
          <v-badge
            color="error"
            content="1"
            inline
          />
        </template>
      </v-list-item>
      <v-list-item
        :prepend-icon="mdiTextBoxSearchOutline"
        :title="t('nav.logs')"
        to="/logs"
        rounded="lg"
      />
      <v-list-item
        :prepend-icon="mdiKeyChainVariant"
        :title="t('nav.sso')"
        to="/sso"
        rounded="lg"
      />
      <v-list-item
        :prepend-icon="mdiFileCertificateOutline"
        :title="t('nav.pki')"
        to="/pki"
        rounded="lg"
      />
    </v-list>

    <template #append>
      <div class="pa-4">
        <v-card
          color="primary"
          rounded="lg"
          flat
        >
          <v-card-text class="text-center pa-4">
            <v-icon
              :icon="mdiShieldCheckOutline"
              color="secondary"
              size="28"
              class="mb-1"
            />
            <p class="text-caption text-white mb-0">
              Demo-Umgebung – Anzeige mit Beispieldaten, keine produktiven
              Daten.
            </p>
          </v-card-text>
        </v-card>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import {
  mdiClockOutline,
  mdiEmailFastOutline,
  mdiFileCertificateOutline,
  mdiFileSign,
  mdiKeyChainVariant,
  mdiPawOutline,
  mdiShieldCheckOutline,
  mdiTextBoxSearchOutline,
  mdiUsbFlashDrive,
  mdiViewDashboardOutline,
} from "@mdi/js";
import { useMediaQuery } from "@vueuse/core";
import { useI18n } from "vue-i18n";

const showDrawer = defineModel<boolean>({ required: true });
const isDesktop = useMediaQuery("(min-width: 960px)");
const { t } = useI18n();
</script>

<style scoped>
.lh-1 {
  line-height: 1.15;
}
</style>
