import type {
  AppConsentRequest,
  AuditLog,
  CronJob,
  CronStatus,
  PinLetter,
  Readiness,
  RequestLog,
  SignedScript,
  SsoEnv,
} from "@/types/domain";

import { ago, inFuture } from "@/mock/helpers";

export const READINESS: Readiness = {
  uptime: 1_482_930,
  status: "ok",
};

export const CRON_STATUS: CronStatus = {
  overall_health: "degraded",
  jobs: {
    registered: 9,
    running: 1,
    failed: 1,
    succeeded: 6,
    not_started: 1,
  },
  cache_status: { backend: "Redis (Cluster)", reachable: true },
  status_text: "1 Job benötigt Aufmerksamkeit (sync_vpsx_db).",
};

export const CRON_JOBS: CronJob[] = [
  {
    name: "sync_ad_directory",
    func: "panda3backend.jobs.sync_ad_directory",
    expression: "*/15 * * * *",
    current_state: "succeeded",
    next_run: inFuture({ minutes: 11 }),
    last_run: ago({ minutes: 4 }),
    run_mode: "cluster",
    update_timestamp: ago({ minutes: 4 }),
  },
  {
    name: "spool_pin_letters",
    func: "panda3backend.jobs.spool_pin_letters",
    expression: "0 6 * * 2,4",
    current_state: "succeeded",
    next_run: inFuture({ days: 2, hours: 3 }),
    last_run: ago({ days: 1, hours: 5 }),
    run_mode: "single_node",
    update_timestamp: ago({ days: 1, hours: 5 }),
  },
  {
    name: "sync_vpsx_db",
    func: "panda3backend.jobs.sync_vpsx_db",
    expression: "*/30 * * * *",
    current_state: "failed_error",
    next_run: inFuture({ minutes: 17 }),
    last_run: ago({ minutes: 13 }),
    run_mode: "single_node",
    update_timestamp: ago({ minutes: 13 }),
  },
  {
    name: "cleanup_expired_otp",
    func: "panda3backend.jobs.cleanup_expired_otp",
    expression: "0 * * * *",
    current_state: "succeeded",
    next_run: inFuture({ minutes: 42 }),
    last_run: ago({ minutes: 18 }),
    run_mode: "cluster",
    update_timestamp: ago({ minutes: 18 }),
  },
  {
    name: "refresh_consent_requests",
    func: "panda3backend.jobs.refresh_consent_requests",
    expression: "*/10 * * * *",
    current_state: "running",
    next_run: inFuture({ minutes: 6 }),
    last_run: ago({ minutes: 4 }),
    run_mode: "single_node",
    update_timestamp: ago({ minutes: 1 }),
  },
  {
    name: "rotate_pki_crl",
    func: "panda3backend.jobs.rotate_pki_crl",
    expression: "0 2 * * *",
    current_state: "succeeded",
    next_run: inFuture({ hours: 14 }),
    last_run: ago({ hours: 10 }),
    run_mode: "single_node",
    update_timestamp: ago({ hours: 10 }),
  },
  {
    name: "fes_software_heartbeat",
    func: "panda3backend.jobs.fes_software_heartbeat",
    expression: "*/5 * * * *",
    current_state: "succeeded",
    next_run: inFuture({ minutes: 2 }),
    last_run: ago({ minutes: 3 }),
    run_mode: "cluster",
    update_timestamp: ago({ minutes: 3 }),
  },
  {
    name: "audit_log_archival",
    func: "panda3backend.jobs.audit_log_archival",
    expression: "30 1 * * 0",
    current_state: "succeeded",
    next_run: inFuture({ days: 4 }),
    last_run: ago({ days: 3 }),
    run_mode: "single_node",
    update_timestamp: ago({ days: 3 }),
  },
  {
    name: "warm_directory_cache",
    func: "panda3backend.jobs.warm_directory_cache",
    expression: "0 5 * * *",
    current_state: "not_started",
    next_run: inFuture({ hours: 17 }),
    last_run: null,
    run_mode: "cluster",
    update_timestamp: ago({ hours: 1 }),
  },
];

const METHODS = ["GET", "POST", "POST", "GET", "DELETE", "GET"];
const PATHS = [
  "/token/person",
  "/token/enroll",
  "/fes/person",
  "/token/einmalpin",
  "/token/unassign_token",
  "/admin/cron/jobs",
  "/sso/entra_id/app_consent_requests",
  "/fes/users",
  "/pki/codesigning/sign_script",
];
const USERS = [
  "anna.bauer",
  "lukas.wagner",
  "svc-panda-gateway",
  "tobias.stadler",
  "michael.koch",
];

export const REQUEST_LOGS: RequestLog[] = Array.from({ length: 24 }, (_, i) => {
  const status =
    i % 11 === 0 ? 422 : i % 17 === 0 ? 500 : i % 7 === 0 ? 404 : 200;
  return {
    id: `req-${(1000 + i).toString()}`,
    timestamp: ago({ minutes: i * 7 + 1 }),
    method: METHODS[i % METHODS.length] ?? "GET",
    path: PATHS[i % PATHS.length] ?? "/token/person",
    status,
    duration_ms: 35 + ((i * 53) % 880),
    user: USERS[i % USERS.length] ?? "svc-panda-gateway",
    client_ip: `10.12.${(i % 4) + 1}.${(i * 13) % 250}`,
  };
});

const ACTIONS = [
  "Token enrollt",
  "EinmalPIN erstellt",
  "Tagespass vergeben",
  "Token entfernt",
  "FES aktiviert",
  "FES deaktiviert",
  "RA-Admin-Recht erteilt",
  "Person entsperrt",
  "PIN-Brief gespoolt",
];

export const AUDIT_LOGS: AuditLog[] = Array.from({ length: 18 }, (_, i) => {
  const outcome = i % 9 === 0 ? "error" : i % 6 === 0 ? "denied" : "success";
  return {
    id: `aud-${(5000 + i).toString()}`,
    timestamp: ago({ hours: i * 3 + 1, minutes: (i * 11) % 60 }),
    actor: USERS[i % USERS.length] ?? "anna.bauer",
    action: ACTIONS[i % ACTIONS.length] ?? "Token enrollt",
    target: ["maria.huber", "josef.maier", "fatima.yilmaz", "michael.koch"][
      i % 4
    ] as string,
    outcome,
  };
});

export const PIN_LETTERS: PinLetter[] = [
  {
    lhmObjectID: "1002210",
    givenName: "Maria",
    sn: "Huber",
    ou: "KVR",
    streetAddress: "Ruppertstraße 19",
    postalCode: "80337",
    l: "München",
    mode: "neu",
    externalMail: false,
    date: ago({ hours: 6 }),
  },
  {
    lhmObjectID: "1007654",
    givenName: "Josef",
    sn: "Maier",
    ou: "RBS",
    streetAddress: "Bayerstraße 28",
    postalCode: "80335",
    l: "München",
    mode: "tausch",
    externalMail: false,
    date: ago({ hours: 20 }),
  },
  {
    lhmObjectID: "1005566",
    givenName: "Fatima",
    sn: "Yılmaz",
    ou: "BAU",
    streetAddress: "Friedenstraße 40",
    postalCode: "81671",
    l: "München",
    mode: "neu",
    externalMail: true,
    date: ago({ days: 1, hours: 2 }),
  },
];

export const CONSENT_REQUESTS: AppConsentRequest[] = [
  {
    Id: "ce41-0091",
    AppDisplayName: "Miro – Visual Collaboration",
    AppId: "a1b2c3d4-1111-2222-3333-444455556666",
    Scopes: ["User.Read", "offline_access", "email", "Files.Read"],
    Name: "Anna Bauer",
    Email: "anna.bauer@muenchen.de",
    Reason: "Workshop-Moderation für Referatsklausur RIT",
    Created: ago({ hours: 4 }),
    Status: "pending",
  },
  {
    Id: "ce41-0092",
    AppDisplayName: "Adobe Acrobat for Microsoft 365",
    AppId: "a1b2c3d4-aaaa-bbbb-cccc-ddddeeeeffff",
    Scopes: ["User.Read", "Files.ReadWrite.All"],
    Name: "Josef Maier",
    Email: "josef.maier@muenchen.de",
    Reason: "PDF-Bearbeitung Schulunterlagen",
    Created: ago({ hours: 26 }),
    Status: "pending",
  },
  {
    Id: "ce41-0090",
    AppDisplayName: "Lucidchart Diagrams",
    AppId: "a1b2c3d4-9999-8888-7777-666655554444",
    Scopes: ["User.Read", "offline_access"],
    Name: "Lukas Wagner",
    Email: "lukas.wagner@muenchen.de",
    Reason: "Netzplan-Dokumentation Infrastruktur",
    Created: ago({ days: 2 }),
    Status: "approved",
  },
  {
    Id: "ce41-0089",
    AppDisplayName: "Unbekannte Drittanbieter-App",
    AppId: "a1b2c3d4-0000-1111-2222-333344445555",
    Scopes: ["User.ReadWrite.All", "Directory.Read.All", "Mail.Read"],
    Name: "Sophie Fischer",
    Email: "sophie.fischer@muenchen.de",
    Reason: "—",
    Created: ago({ days: 3 }),
    Status: "rejected",
  },
];

export const SSO_ENVS: SsoEnv[] = [
  {
    name: "prod",
    display_name: "Produktion",
    realm_name: "lhm-intern",
    directory_link: "https://sso.muenchen.de/admin/lhm-intern/console",
  },
  {
    name: "test",
    display_name: "Test / Abnahme",
    realm_name: "lhm-intern-test",
    directory_link:
      "https://sso-test.muenchen.de/admin/lhm-intern-test/console",
  },
  {
    name: "entwicklung",
    display_name: "Entwicklung",
    realm_name: "lhm-intern-dev",
    directory_link: "https://sso-dev.muenchen.de/admin/lhm-intern-dev/console",
  },
  {
    name: "buerger",
    display_name: "Bürgerportal",
    realm_name: "muenchen-buergerkonto",
    directory_link: "https://login.muenchen.de/admin/buergerkonto/console",
  },
];

export const SIGNED_SCRIPTS: SignedScript[] = [
  {
    id: "sig-2041",
    filename: "Set-LHMClientPolicy.ps1",
    signed_at: ago({ hours: 2 }),
    requester: "lukas.wagner",
    size_kb: 14.2,
    cert_thumbprint: "9F2C…A41B",
    status: "signed",
  },
  {
    id: "sig-2040",
    filename: "Install-SecSigner.psm1",
    signed_at: ago({ hours: 7 }),
    requester: "anna.bauer",
    size_kb: 38.7,
    cert_thumbprint: "9F2C…A41B",
    status: "signed",
  },
  {
    id: "sig-2039",
    filename: "Rotate-AppSecrets.ps1",
    signed_at: ago({ days: 1, hours: 3 }),
    requester: "tobias.stadler",
    size_kb: 6.1,
    cert_thumbprint: "9F2C…A41B",
    status: "signed",
  },
  {
    id: "sig-2038",
    filename: "legacy-bootstrap.ps",
    signed_at: ago({ days: 2 }),
    requester: "josef.maier",
    size_kb: 2.4,
    cert_thumbprint: "—",
    status: "failed",
  },
];
