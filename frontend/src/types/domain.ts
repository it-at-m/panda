/**
 * Lightweight domain types mirroring the panda3backend OpenAPI schema.
 * Only the fields used by the demo UI are modelled.
 */

export type TokenBackend = "DUO" | "PrivacyIDEA";

export type TokenPermission =
  | "admin_proxy"
  | "admin_proxy_test"
  | "konzernbilanzen"
  | "fernzugriff"
  | "fernwartung_admin"
  | "fernwartung_extern";

export type VpsxSyncStatus = "YK_IN_SYNC" | "NO_YK" | "OTHER_YK" | "NO_ENTRY";

export type DuoStatus =
  | "active"
  | "bypass"
  | "disabled"
  | "locked out"
  | "pending deletion"
  | "user_does_not_exist_in_duo";

export interface PersonLdap {
  uid: string;
  givenName: string;
  sn: string;
  cn: string;
  title?: string | null;
  lhmFunctionalTitle?: string | null;
  employeeType?: string | null;
  ou?: string | null;
  lhmOULongname?: string | null;
  mail?: string | null;
  mobile?: string | null;
  telephoneNumber?: string | null;
  l?: string | null;
  street?: string | null;
  roomNumber?: string | null;
  nsAccountLock: boolean;
}

export interface PersonCore {
  username: string;
  lhmObjectID: string;
  mail: string | null;
  ldap: PersonLdap;
  ad_is_disabled: boolean;
  ad_is_locked: boolean;
  is_pzi: boolean;
  is_nwk: boolean;
}

export type TokenKind =
  | "Yubikey"
  | "Webauthncredential"
  | "FullWebauthncredential"
  | "PushToken"
  | "EinmalPin"
  | "Tagespass";

export interface BaseToken {
  kind: TokenKind;
  backend: TokenBackend;
  id: string;
}

export interface Yubikey extends BaseToken {
  kind: "Yubikey";
  serial: string;
  yk_type?: "5" | "5c" | null;
  nfcid?: string | null;
}

export interface WebauthnToken extends BaseToken {
  kind: "FullWebauthncredential" | "Webauthncredential";
  credential_name: string;
  label: string;
  date_added: string;
  date_last_used?: string | null;
  registered_as?: "platform" | "cross-platform" | "unknown";
  transports?: string[];
  passwordless_authorized?: boolean;
}

export interface PushTokenT extends BaseToken {
  kind: "PushToken";
  activated: boolean;
  app_version: string;
  os_version: string;
  model: string;
  last_seen?: string | null;
}

export interface OtpToken extends BaseToken {
  kind: "EinmalPin" | "Tagespass";
  created: string;
  expiration: string;
  reuse_count: number;
  value?: string | null;
}

export type AnyToken = Yubikey | WebauthnToken | PushTokenT | OtpToken;

export type AuthResult = "success" | "denied" | "failure" | "error" | "fraud";

export interface AuthlogEntry {
  backend: TokenBackend;
  timestamp: string;
  application_name: string;
  event_type: "authentication" | "enrollment";
  result: AuthResult;
  reason?: string | null;
  factor: string;
}

export interface DuoInfo {
  status: DuoStatus;
  is_enrolled: boolean;
  last_login?: string | null;
  email: string;
}

export interface TokenPerson extends PersonCore {
  duo: DuoInfo | null;
  access: Partial<Record<TokenBackend, TokenPermission[]>>;
  token: AnyToken[];
  authlogs: AuthlogEntry[];
  vpsx_sync: VpsxSyncStatus;
}

export interface PkiCertEntry {
  serial: string;
  request_id: number;
  requester: string;
  cn: string;
  cert_template: string;
  disposition: 20 | 9 | 21 | 31;
}

export interface SoftwareInstall {
  product: string;
  version: string;
  up_to_date_version: string;
  client: string;
  last_heartbeat: string;
}

export interface FesPerson extends PersonCore {
  is_enabled: boolean;
  is_ra_admin: boolean;
  signing_certs: PkiCertEntry[];
  ra_enrollment_certs: PkiCertEntry[];
  software_installs: SoftwareInstall[];
  computers: string[];
}

export interface PinLetter {
  lhmObjectID: string;
  givenName: string;
  sn: string;
  ou: string;
  streetAddress: string;
  postalCode: string;
  l: string;
  mode: "neu" | "tausch";
  externalMail: boolean;
  date?: string;
}

export type CronState =
  | "not_started"
  | "running"
  | "failed_error"
  | "failed_timeout"
  | "failed_fachlich"
  | "succeeded";

export interface CronJob {
  name: string;
  expression: string;
  func: string;
  current_state: CronState;
  next_run: string;
  last_run?: string | null;
  run_mode: "single_node" | "cluster";
  update_timestamp: string;
}

export type CronHealth = "healthy" | "degraded" | "unhealthy" | "inconsistent";

export interface CronStatus {
  overall_health: CronHealth;
  jobs: {
    registered: number;
    running: number;
    failed: number;
    succeeded: number;
    not_started: number;
  };
  cache_status: { backend: string; reachable: boolean };
  status_text?: string | null;
}

export interface RequestLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  user: string;
  client_ip: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  outcome: "success" | "denied" | "error";
}

export interface AppConsentRequest {
  Id: string;
  AppDisplayName: string;
  AppId: string;
  Scopes: string[];
  Name: string;
  Email: string;
  Reason: string;
  Created: string;
  Status: "pending" | "approved" | "rejected";
}

export interface SsoEnv {
  name: string;
  display_name: string;
  realm_name: string;
  directory_link: string;
}

export interface SignedScript {
  id: string;
  filename: string;
  signed_at: string;
  requester: string;
  size_kb: number;
  cert_thumbprint: string;
  status: "signed" | "failed";
}

export interface Readiness {
  uptime: number;
  status: "ok";
}
