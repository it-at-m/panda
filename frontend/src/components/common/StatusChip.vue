<template>
  <v-chip
    :color="indicator.color"
    size="small"
    variant="tonal"
    label
    :prepend-icon="indicator.icon"
  >
    <span
      v-if="dot"
      class="status-dot mr-2"
      :class="`bg-${indicator.color}`"
      aria-hidden="true"
    />
    {{ indicator.label }}
  </v-chip>
</template>

<script setup lang="ts">
import type { Indicator } from "@/util/display";

withDefaults(
  defineProps<{
    indicator: Indicator;
    dot?: boolean;
  }>(),
  { dot: false }
);
</script>

<style scoped>
.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
</style>
