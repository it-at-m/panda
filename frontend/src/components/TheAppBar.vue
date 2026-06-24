<template>
  <v-app-bar
    flat
    border="b"
    color="surface"
    height="68"
  >
    <v-app-bar-nav-icon
      v-if="!isDesktop"
      :aria-label="t('nav.openMenu')"
      class="ms-1"
      @click="emit('clickedNavIcon')"
    />

    <router-link
      v-if="!isDesktop"
      to="/"
      class="text-decoration-none d-flex align-center ga-2 ms-1"
    >
      <span class="text-h6 font-weight-bold text-primary">{{
        t("app.name.part1")
      }}</span>
    </router-link>

    <v-text-field
      v-model="query"
      variant="solo-filled"
      flat
      rounded="lg"
      density="comfortable"
      hide-details
      single-line
      :label="t('common.actions.search')"
      :prepend-inner-icon="mdiMagnify"
      class="search-field ms-2 me-2"
      style="max-width: 420px"
      @keyup.enter="search"
    />

    <v-spacer />

    <v-tooltip
      :text="t('common.theme.toggle')"
      location="bottom"
    >
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          :icon="isDark ? mdiWeatherSunny : mdiWeatherNight"
          :aria-label="t('common.theme.toggle')"
          variant="text"
          @click="toggleTheme"
        />
      </template>
    </v-tooltip>

    <app-switcher
      v-if="APPSWITCHER_URL"
      :base-url="APPSWITCHER_URL"
      :tags="['global']"
      :icon="mdiApps"
    />

    <v-menu location="bottom end">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          variant="text"
          class="text-none px-2 me-2"
          height="48"
        >
          <v-avatar
            color="primary"
            size="36"
            class="text-body-2 font-weight-bold"
          >
            {{ initials(displayName) }}
          </v-avatar>
          <div class="d-none d-md-block text-start ms-2">
            <div class="text-body-2 font-weight-medium lh-1">
              {{ displayName }}
            </div>
            <div class="text-caption text-medium-emphasis">Administrator</div>
          </div>
          <v-icon
            :icon="mdiChevronDown"
            size="18"
            class="ms-1 d-none d-md-inline"
          />
        </v-btn>
      </template>
      <v-list
        density="comfortable"
        min-width="220"
        nav
      >
        <v-list-item
          :prepend-avatar="undefined"
          :title="displayName"
          :subtitle="userMail"
        >
          <template #prepend>
            <v-avatar
              color="primary"
              size="40"
              class="text-body-2 font-weight-bold"
            >
              {{ initials(displayName) }}
            </v-avatar>
          </template>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item
          :prepend-icon="mdiAccountOutline"
          title="Mein Profil"
          @click="notImplemented"
        />
        <v-list-item
          :prepend-icon="mdiCogOutline"
          title="Einstellungen"
          @click="notImplemented"
        />
        <v-list-item
          :prepend-icon="mdiLogoutVariant"
          title="Abmelden"
          base-color="error"
          @click="notImplemented"
        />
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import {
  mdiAccountOutline,
  mdiApps,
  mdiChevronDown,
  mdiCogOutline,
  mdiLogoutVariant,
  mdiMagnify,
  mdiWeatherNight,
  mdiWeatherSunny,
} from "@mdi/js";
import { AppSwitcher } from "@muenchen/appswitcher-vue";
import { useMediaQuery } from "@vueuse/core";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTheme } from "vuetify";

import { APPSWITCHER_URL } from "@/constants";
import { useSnackbarStore } from "@/stores/snackbar";
import { useUserInfoStore } from "@/stores/userinfo";
import { initials } from "@/util/display";

const userInfoStore = useUserInfoStore();
const snackbarStore = useSnackbarStore();
const { t } = useI18n();
const isDesktop = useMediaQuery("(min-width: 960px)");
const theme = useTheme();

const query = ref<string>("");

const displayName = computed(
  () => userInfoStore.userInfo?.name ?? "Anna Bauer"
);
const userMail = computed(
  () => userInfoStore.userInfo?.email ?? "anna.bauer@muenchen.de"
);

const isDark = computed(() => theme.global.name.value === "dark");
function toggleTheme(): void {
  theme.global.name.value = isDark.value ? "light" : "dark";
}

function search(): void {
  if (query.value) {
    snackbarStore.push({
      text: `Globale Suche nach „${query.value}“ (Demo).`,
    });
  }
}

function notImplemented(): void {
  snackbarStore.push({ text: "Demo: Aktion ist nicht hinterlegt." });
}

const emit = defineEmits<{
  clickedNavIcon: [];
}>();
</script>

<style scoped>
.lh-1 {
  line-height: 1.15;
}
</style>
