<template>
  <v-card
    border
    flat
    class="h-100"
  >
    <v-card-item v-if="title">
      <template
        v-if="icon"
        #prepend
      >
        <v-icon
          :icon="icon"
          :color="color"
        />
      </template>
      <v-card-title class="text-subtitle-1 font-weight-bold">
        {{ title }}
      </v-card-title>
      <v-card-subtitle v-if="subtitle">{{ subtitle }}</v-card-subtitle>
      <template #append>
        <slot name="append" />
      </template>
    </v-card-item>
    <v-divider v-if="title && divider" />
    <v-card-text :class="{ 'pt-4': title }">
      <slot />
    </v-card-text>
    <slot name="footer" />
  </v-card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    subtitle?: string;
    icon?: string;
    color?: string;
    divider?: boolean;
  }>(),
  {
    title: undefined,
    subtitle: undefined,
    icon: undefined,
    color: "primary",
    divider: true,
  }
);
</script>
