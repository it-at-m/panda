import type {
  AuthResult,
  CronHealth,
  CronState,
  DuoStatus,
  TokenKind,
  VpsxSyncStatus,
} from "@/types/domain";

import {
  mdiAccountKey,
  mdiCellphone,
  mdiClockOutline,
  mdiKey,
  mdiTicketConfirmation,
  mdiUsb,
} from "@mdi/js";

export interface Indicator {
  color: string;
  label: string;
  icon?: string;
}

/** Relative + absolute timestamp formatting. */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function relativeTime(iso?: string | null): string {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const future = diffMs < 0;
  const abs = Math.abs(diffMs);
  const min = Math.round(abs / 60000);
  const hour = Math.round(abs / 3_600_000);
  const day = Math.round(abs / 86_400_000);
  let text: string;
  if (min < 1) text = "gerade eben";
  else if (min < 60) text = `${min} Min.`;
  else if (hour < 24) text = `${hour} Std.`;
  else text = `${day} Tg.`;
  if (text === "gerade eben") return text;
  return future ? `in ${text}` : `vor ${text}`;
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d} T ${h} Std ${m} Min`;
}

export const TOKEN_KIND_META: Record<
  TokenKind,
  { label: string; icon: string; color: string }
> = {
  Yubikey: { label: "YubiKey", icon: mdiUsb, color: "primary" },
  FullWebauthncredential: {
    label: "WebAuthn / Passkey",
    icon: mdiKey,
    color: "accent",
  },
  Webauthncredential: {
    label: "WebAuthn / Passkey",
    icon: mdiKey,
    color: "accent",
  },
  PushToken: { label: "Duo Mobile (Push)", icon: mdiCellphone, color: "info" },
  EinmalPin: {
    label: "Einmal-PIN",
    icon: mdiAccountKey,
    color: "warning",
  },
  Tagespass: {
    label: "Tagespass",
    icon: mdiTicketConfirmation,
    color: "warning",
  },
};

export function cronStateIndicator(state: CronState): Indicator {
  switch (state) {
    case "succeeded":
      return { color: "success", label: "Erfolgreich" };
    case "running":
      return { color: "info", label: "Läuft", icon: mdiClockOutline };
    case "not_started":
      return { color: "grey", label: "Nicht gestartet" };
    case "failed_error":
      return { color: "error", label: "Fehler" };
    case "failed_timeout":
      return { color: "error", label: "Timeout" };
    case "failed_fachlich":
      return { color: "warning", label: "Fachlicher Fehler" };
    default:
      return { color: "grey", label: state };
  }
}

export function cronHealthIndicator(health: CronHealth): Indicator {
  switch (health) {
    case "healthy":
      return { color: "success", label: "Gesund" };
    case "degraded":
      return { color: "warning", label: "Eingeschränkt" };
    case "unhealthy":
      return { color: "error", label: "Gestört" };
    case "inconsistent":
      return { color: "error", label: "Inkonsistent" };
    default:
      return { color: "grey", label: health };
  }
}

export function duoStatusIndicator(status: DuoStatus): Indicator {
  switch (status) {
    case "active":
      return { color: "success", label: "Aktiv" };
    case "bypass":
      return { color: "warning", label: "Bypass" };
    case "disabled":
      return { color: "grey", label: "Deaktiviert" };
    case "locked out":
      return { color: "error", label: "Gesperrt" };
    case "pending deletion":
      return { color: "warning", label: "Löschung ausstehend" };
    default:
      return { color: "grey", label: "Nicht in Duo" };
  }
}

export function authResultIndicator(result: AuthResult): Indicator {
  switch (result) {
    case "success":
      return { color: "success", label: "Erfolg" };
    case "denied":
      return { color: "warning", label: "Abgelehnt" };
    case "failure":
      return { color: "error", label: "Fehlgeschlagen" };
    case "error":
      return { color: "error", label: "Fehler" };
    case "fraud":
      return { color: "error", label: "Betrugsverdacht" };
    default:
      return { color: "grey", label: result };
  }
}

export function vpsxIndicator(status: VpsxSyncStatus): Indicator {
  switch (status) {
    case "YK_IN_SYNC":
      return { color: "success", label: "Synchron" };
    case "OTHER_YK":
      return { color: "warning", label: "Anderer YubiKey" };
    case "NO_YK":
      return { color: "warning", label: "Kein YubiKey" };
    default:
      return { color: "grey", label: "Kein Eintrag" };
  }
}

export function httpStatusColor(status: number): string {
  if (status < 300) return "success";
  if (status < 400) return "info";
  if (status < 500) return "warning";
  return "error";
}

const DISPOSITION_LABEL: Record<number, Indicator> = {
  20: { color: "success", label: "Ausgestellt" },
  9: { color: "info", label: "Ausstehend" },
  21: { color: "error", label: "Gesperrt" },
  31: { color: "error", label: "Abgelehnt" },
};

export function dispositionIndicator(disposition: number): Indicator {
  return (
    DISPOSITION_LABEL[disposition] ?? { color: "grey", label: "Unbekannt" }
  );
}

export function outcomeIndicator(
  outcome: "success" | "denied" | "error"
): Indicator {
  switch (outcome) {
    case "success":
      return { color: "success", label: "Erfolg" };
    case "denied":
      return { color: "warning", label: "Abgelehnt" };
    default:
      return { color: "error", label: "Fehler" };
  }
}

export function consentStatusIndicator(
  status: "pending" | "approved" | "rejected"
): Indicator {
  switch (status) {
    case "pending":
      return { color: "warning", label: "Offen" };
    case "approved":
      return { color: "success", label: "Genehmigt" };
    default:
      return { color: "error", label: "Abgelehnt" };
  }
}

export const TOKEN_PERMISSION_LABEL: Record<string, string> = {
  admin_proxy: "Admin-Proxy",
  admin_proxy_test: "Admin-Proxy (Test)",
  konzernbilanzen: "Konzernbilanzen",
  fernzugriff: "Fernzugriff (VPN)",
  fernwartung_admin: "Fernwartung Admin",
  fernwartung_extern: "Fernwartung Extern",
};

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}
