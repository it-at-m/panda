/**
 * Small helpers for generating deterministic-ish demo data.
 * No real backend is involved – everything lives in the browser.
 */

const NOW = new Date();

/** ISO timestamp `days`/`hours`/`minutes` ago (negative = in the future). */
export function ago({
  days = 0,
  hours = 0,
  minutes = 0,
}: {
  days?: number;
  hours?: number;
  minutes?: number;
}): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - days);
  d.setHours(d.getHours() - hours);
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
}

/** ISO timestamp `minutes` in the future. */
export function inFuture({
  days = 0,
  hours = 0,
  minutes = 0,
}: {
  days?: number;
  hours?: number;
  minutes?: number;
}): string {
  return ago({ days: -days, hours: -hours, minutes: -minutes });
}

/** Simulate a network round-trip so loading states are visible in the demo. */
export function delay<T>(value: T, ms = 450): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
