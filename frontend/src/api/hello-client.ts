import { defaultResponseHandler, getConfig } from "@/api/fetch-utils";
import { BASE_API_PATH } from "@/constants";

export interface HelloResponse {
  message: string;
}

/**
 * Calls the FastAPI "Hallo Welt" endpoint.
 * Resolves to `/api/backend/hello`, which the Vite dev server proxies to the
 * backend running in Docker on http://localhost:8083.
 */
export function getHello(): Promise<HelloResponse> {
  return fetch(`${BASE_API_PATH}/hello`, getConfig()).then((response) => {
    defaultResponseHandler(response);
    return response.json();
  });
}
