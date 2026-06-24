<template>
  <header class="page-header mb-6">
    <div class="d-flex align-center flex-wrap ga-4">
      <v-avatar
        v-if="icon"
        :color="color"
        rounded="lg"
        size="52"
        class="elevation-2"
      >
        <v-icon
          :icon="icon"
          size="28"
          color="white"
        />
      </v-avatar>
      <div
        class="flex-grow-1"
        style="min-width: 200px"
      >
        <p
          v-if="eyebrow"
          class="text-overline text-medium-emphasis mb-0"
        >
          {{ eyebrow }}
        </p>
        <h1 class="text-h4 font-weight-bold">{{ title }}</h1>
        <p
          v-if="subtitle"
          class="text-body-1 text-medium-emphasis mt-1 mb-0"
        >
          {{ subtitle }}
        </p>
      </div>
      <div class="d-flex align-center ga-2 flex-wrap">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    eyebrow?: string;
    icon?: string;
    color?: string;
  }>(),
  {
    subtitle: undefined,
    eyebrow: undefined,
    icon: undefined,
    color: "primary",
  }
);
</script>
