<template>
  <div class="data-field">
    <dt class="text-caption text-medium-emphasis">{{ label }}</dt>
    <dd class="text-body-2 font-weight-medium mb-0">
      <slot>{{ value ?? "—" }}</slot>
    </dd>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value?: string | number | null;
  }>(),
  { value: undefined }
);
</script>

<style scoped>
.data-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
