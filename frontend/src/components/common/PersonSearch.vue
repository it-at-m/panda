<template>
  <v-card
    border
    flat
  >
    <v-card-text class="pa-4">
      <v-text-field
        v-model="query"
        :label="label"
        :placeholder="placeholder"
        :prepend-inner-icon="mdiAccountSearch"
        clearable
        hide-details
        autofocus
        :loading="loading"
        @update:model-value="onInput"
      />
      <v-list
        v-if="query && results.length"
        class="mt-2"
        density="comfortable"
        nav
      >
        <v-list-item
          v-for="person in results"
          :key="person.username"
          :active="person.username === selected"
          rounded="lg"
          @click="emit('select', person.username)"
        >
          <template #prepend>
            <v-avatar
              color="primary"
              size="40"
              class="text-body-2 font-weight-bold"
            >
              {{ initials(person.ldap.cn) }}
            </v-avatar>
          </template>
          <v-list-item-title class="font-weight-medium">
            {{ person.ldap.cn }}
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ person.username }} · {{ person.ldap.ou }}
          </v-list-item-subtitle>
          <template #append>
            <v-icon
              :icon="mdiChevronRight"
              class="text-medium-emphasis"
            />
          </template>
        </v-list-item>
      </v-list>
      <p
        v-else-if="query && !loading"
        class="text-body-2 text-medium-emphasis text-center my-4"
      >
        Keine Person gefunden für „{{ query }}“.
      </p>
      <p
        v-else
        class="text-caption text-medium-emphasis mt-3 mb-1"
      >
        Tipp: Suche nach Benutzerkennung, Name, LHM-Objekt-ID oder Referat –
        z.&nbsp;B. „bauer“, „1009871“ oder „KVR“.
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import type { PersonCore } from "@/types/domain";

import { mdiAccountSearch, mdiChevronRight } from "@mdi/js";
import { ref } from "vue";

import { initials } from "@/util/display";

withDefaults(
  defineProps<{
    results: PersonCore[];
    loading?: boolean;
    selected?: string;
    label?: string;
    placeholder?: string;
  }>(),
  {
    loading: false,
    selected: "",
    label: "Person suchen",
    placeholder: "Name, Kennung oder LHM-Objekt-ID",
  }
);

const emit = defineEmits<{
  select: [username: string];
  search: [query: string];
}>();

const query = ref("");

function onInput(value: string | null): void {
  emit("search", value ?? "");
}
</script>
