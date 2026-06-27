import { defineStore } from "pinia";
import { readonly, ref } from "vue";

import { getHello } from "@/api/hello-client";

/**
 * Pinia store holding the "Hallo Welt" message coming from the FastAPI backend.
 * The component triggers `fetchHello()` and reads the reactive state below.
 */
export const useHelloStore = defineStore("hello", () => {
  const internalMessage = ref<string | null>(null);
  const message = readonly(internalMessage);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchHello(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const response = await getHello();
      internalMessage.value = response.message;
    } catch {
      internalMessage.value = null;
      error.value =
        "Backend nicht erreichbar. Läuft der FastAPI-Container? (cd backend && docker compose up --build)";
    } finally {
      loading.value = false;
    }
  }

  return { message, loading, error, fetchHello };
});
