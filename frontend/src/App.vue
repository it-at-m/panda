<template>
  <v-app>
    <the-snackbar-queue />
    <the-app-bar @clicked-nav-icon="toggleNavigation" />
    <the-navigation-drawer v-model="isNavigationShown" />
    <v-main class="bg-background">
      <v-container
        fluid
        class="pa-4 pa-sm-6"
        style="max-width: 1600px"
      >
        <router-view v-slot="{ Component }">
          <v-fade-transition mode="out-in">
            <component :is="Component" />
          </v-fade-transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useMediaQuery, useToggle } from "@vueuse/core";
import { watch } from "vue";

import TheAppBar from "@/components/TheAppBar.vue";
import TheNavigationDrawer from "@/components/TheNavigationDrawer.vue";
import TheSnackbarQueue from "@/components/TheSnackbarQueue.vue";

const isDesktop = useMediaQuery("(min-width: 960px)");
const [isNavigationShown, toggleNavigation] = useToggle(isDesktop.value);

// Keep the drawer open on desktop and collapsed on mobile when the
// viewport crosses the breakpoint.
watch(isDesktop, (desktop) => {
  isNavigationShown.value = desktop;
});
</script>
