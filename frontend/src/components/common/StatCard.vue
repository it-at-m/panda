<template>
  <v-card
    :to="to"
    border
    flat
    class="stat-card h-100"
    :aria-label="`${label}: ${value}`"
  >
    <v-card-text class="d-flex align-center ga-4 pa-5">
      <v-avatar
        :color="color"
        rounded="lg"
        size="48"
        variant="tonal"
      >
        <v-icon
          :icon="icon"
          size="26"
        />
      </v-avatar>
      <div class="flex-grow-1">
        <div class="text-h4 font-weight-bold lh-1">{{ value }}</div>
        <div class="text-body-2 text-medium-emphasis">{{ label }}</div>
      </div>
      <v-chip
        v-if="trend"
        :color="trendColor"
        size="small"
        variant="tonal"
        label
      >
        <v-icon
          start
          :icon="trendIcon"
          size="16"
        />
        {{ trend }}
      </v-chip>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { mdiTrendingDown, mdiTrendingUp } from "@mdi/js";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    icon: string;
    color?: string;
    trend?: string;
    trendDirection?: "up" | "down";
    to?: string;
  }>(),
  {
    color: "primary",
    trend: undefined,
    trendDirection: "up",
    to: undefined,
  }
);

const trendColor = computed(() =>
  props.trendDirection === "up" ? "success" : "error"
);
const trendIcon = computed(() =>
  props.trendDirection === "up" ? mdiTrendingUp : mdiTrendingDown
);
</script>

<style scoped>
.stat-card {
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}
.stat-card[href]:hover,
.stat-card.v-card--link:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08) !important;
}
.lh-1 {
  line-height: 1.1;
}
</style>
