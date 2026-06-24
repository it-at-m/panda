<template>
  <div
    class="d-flex flex-column align-center justify-center text-center pa-8 ga-2"
    role="status"
  >
    <v-avatar
      color="surface-light"
      size="72"
      rounded="lg"
    >
      <v-icon
        :icon="icon"
        size="36"
        class="text-medium-emphasis"
      />
    </v-avatar>
    <p class="text-subtitle-1 font-weight-medium mt-2 mb-0">{{ title }}</p>
    <p
      v-if="text"
      class="text-body-2 text-medium-emphasis mb-0"
      style="max-width: 360px"
    >
      {{ text }}
    </p>
    <slot />
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string;
    title: string;
    text?: string;
  }>(),
  { text: undefined }
);
</script>
