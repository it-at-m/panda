import type {
  AppConsentRequest,
  AuditLog,
  CronJob,
  CronStatus,
  FesPerson,
  PinLetter,
  Readiness,
  RequestLog,
  SignedScript,
  SsoEnv,
  TokenPerson,
} from "@/types/domain";

import { delay } from "@/mock/helpers";
import { FES_PEOPLE, TOKEN_PEOPLE } from "@/mock/people";
import {
  AUDIT_LOGS,
  CONSENT_REQUESTS,
  CRON_JOBS,
  CRON_STATUS,
  PIN_LETTERS,
  READINESS,
  REQUEST_LOGS,
  SIGNED_SCRIPTS,
  SSO_ENVS,
} from "@/mock/system";

function matches(
  person: {
    username: string;
    lhmObjectID: string;
    mail: string | null;
    ldap: { cn: string; ou?: string | null };
  },
  q: string
): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [
    person.username,
    person.lhmObjectID,
    person.mail ?? "",
    person.ldap.cn,
    person.ldap.ou ?? "",
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

export const mockApi = {
  readiness: (): Promise<Readiness> => delay(READINESS, 250),

  // --- Token ---
  searchTokenPeople: (q: string): Promise<TokenPerson[]> =>
    delay(TOKEN_PEOPLE.filter((p) => matches(p, q))),
  getTokenPerson: (username: string): Promise<TokenPerson | undefined> =>
    delay(TOKEN_PEOPLE.find((p) => p.username === username)),
  listTokenPeople: (): Promise<TokenPerson[]> => delay(TOKEN_PEOPLE),

  // --- FES ---
  searchFesPeople: (q: string): Promise<FesPerson[]> =>
    delay(FES_PEOPLE.filter((p) => matches(p, q))),
  getFesPerson: (username: string): Promise<FesPerson | undefined> =>
    delay(FES_PEOPLE.find((p) => p.username === username)),
  listFesEnabled: (): Promise<FesPerson[]> =>
    delay(FES_PEOPLE.filter((p) => p.is_enabled)),

  // --- Admin / Cron / Logs ---
  cronStatus: (): Promise<CronStatus> => delay(CRON_STATUS, 300),
  cronJobs: (): Promise<CronJob[]> => delay(CRON_JOBS),
  requestLogs: (): Promise<RequestLog[]> => delay(REQUEST_LOGS),
  auditLogs: (): Promise<AuditLog[]> => delay(AUDIT_LOGS),

  // --- PIN letters ---
  pinLetters: (): Promise<PinLetter[]> => delay(PIN_LETTERS),

  // --- SSO ---
  consentRequests: (): Promise<AppConsentRequest[]> => delay(CONSENT_REQUESTS),
  ssoEnvs: (): Promise<SsoEnv[]> => delay(SSO_ENVS),

  // --- PKI ---
  signedScripts: (): Promise<SignedScript[]> => delay(SIGNED_SCRIPTS),
};
