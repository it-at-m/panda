import type { FesPerson, TokenPerson } from "@/types/domain";

import { ago, inFuture } from "@/mock/helpers";

/**
 * Master directory of demo people. Each entry powers the token- and
 * FES-views. Names, departments and addresses are fictional but follow
 * the Landeshauptstadt München naming conventions.
 */

interface DirectoryEntry {
  username: string;
  lhmObjectID: string;
  givenName: string;
  sn: string;
  title: string | null;
  functionalTitle: string | null;
  employeeType: string;
  ou: string;
  ouLong: string;
  mobile: string;
  phone: string;
  room: string;
  street: string;
  postalCode: string;
  city: string;
  disabled: boolean;
  locked: boolean;
}

export const DIRECTORY: DirectoryEntry[] = [
  {
    username: "anna.bauer",
    lhmObjectID: "1004523",
    givenName: "Anna",
    sn: "Bauer",
    title: "Dr.",
    functionalTitle: "Referatsleiterin",
    employeeType: "Beamtin",
    ou: "RIT",
    ouLong: "Referat für Informations- und Telekommunikationstechnik",
    mobile: "+49 151 23456789",
    phone: "+49 89 233-45010",
    room: "A 3.14",
    street: "Agnes-Pockels-Bogen 21",
    postalCode: "80992",
    city: "München",
    disabled: false,
    locked: false,
  },
  {
    username: "tobias.stadler",
    lhmObjectID: "1009871",
    givenName: "Tobias",
    sn: "Stadler",
    title: null,
    functionalTitle: "Softwareentwickler",
    employeeType: "Tarifbeschäftigter",
    ou: "RIT-DSP",
    ouLong: "RIT – Digitale Souveränität & Plattformen",
    mobile: "+49 160 9876543",
    phone: "+49 89 233-45120",
    room: "C 1.08",
    street: "Agnes-Pockels-Bogen 21",
    postalCode: "80992",
    city: "München",
    disabled: false,
    locked: false,
  },
  {
    username: "maria.huber",
    lhmObjectID: "1002210",
    givenName: "Maria",
    sn: "Huber",
    title: null,
    functionalTitle: "Sachbearbeiterin Bürgerbüro",
    employeeType: "Tarifbeschäftigte",
    ou: "KVR",
    ouLong: "Kreisverwaltungsreferat",
    mobile: "+49 152 11223344",
    phone: "+49 89 233-96010",
    room: "EG 12",
    street: "Ruppertstraße 19",
    postalCode: "80337",
    city: "München",
    disabled: false,
    locked: true,
  },
  {
    username: "josef.maier",
    lhmObjectID: "1007654",
    givenName: "Josef",
    sn: "Maier",
    title: null,
    functionalTitle: "Teamleiter Schul-IT",
    employeeType: "Beamter",
    ou: "RBS",
    ouLong: "Referat für Bildung und Sport",
    mobile: "+49 170 4455667",
    phone: "+49 89 233-83340",
    room: "B 2.20",
    street: "Bayerstraße 28",
    postalCode: "80335",
    city: "München",
    disabled: false,
    locked: false,
  },
  {
    username: "fatima.yilmaz",
    lhmObjectID: "1005566",
    givenName: "Fatima",
    sn: "Yılmaz",
    title: "Dipl.-Ing.",
    functionalTitle: "Bauingenieurin",
    employeeType: "Tarifbeschäftigte",
    ou: "BAU",
    ouLong: "Baureferat",
    mobile: "+49 176 5566778",
    phone: "+49 89 233-60120",
    room: "D 4.02",
    street: "Friedenstraße 40",
    postalCode: "81671",
    city: "München",
    disabled: false,
    locked: false,
  },
  {
    username: "lukas.wagner",
    lhmObjectID: "1003344",
    givenName: "Lukas",
    sn: "Wagner",
    title: null,
    functionalTitle: "Systemadministrator",
    employeeType: "Tarifbeschäftigter",
    ou: "RIT-INF",
    ouLong: "RIT – Infrastruktur & Betrieb",
    mobile: "+49 151 99887766",
    phone: "+49 89 233-45230",
    room: "C 0.05",
    street: "Agnes-Pockels-Bogen 21",
    postalCode: "80992",
    city: "München",
    disabled: false,
    locked: false,
  },
  {
    username: "sophie.fischer",
    lhmObjectID: "1008899",
    givenName: "Sophie",
    sn: "Fischer",
    title: null,
    functionalTitle: "Sachgebietsleiterin Soziales",
    employeeType: "Beamtin",
    ou: "SOZ",
    ouLong: "Sozialreferat",
    mobile: "+49 162 3344556",
    phone: "+49 89 233-40110",
    room: "2.118",
    street: "Orleansplatz 11",
    postalCode: "81667",
    city: "München",
    disabled: true,
    locked: false,
  },
  {
    username: "michael.koch",
    lhmObjectID: "1006677",
    givenName: "Michael",
    sn: "Koch",
    title: null,
    functionalTitle: "Personalsachbearbeiter",
    employeeType: "Tarifbeschäftigter",
    ou: "POR",
    ouLong: "Personal- und Organisationsreferat",
    mobile: "+49 155 7788990",
    phone: "+49 89 233-21050",
    room: "1.044",
    street: "Marienplatz 8",
    postalCode: "80331",
    city: "München",
    disabled: false,
    locked: false,
  },
];

function buildCore(entry: DirectoryEntry) {
  return {
    username: entry.username,
    lhmObjectID: entry.lhmObjectID,
    mail: `${entry.givenName.toLowerCase()}.${entry.sn
      .toLowerCase()
      .replace(/[^a-z]/g, "")}@muenchen.de`,
    ad_is_disabled: entry.disabled,
    ad_is_locked: entry.locked,
    is_pzi: entry.employeeType === "Tarifbeschäftigter",
    is_nwk: false,
    ldap: {
      uid: entry.username,
      givenName: entry.givenName,
      sn: entry.sn,
      cn: `${entry.givenName} ${entry.sn}`,
      title: entry.title,
      lhmFunctionalTitle: entry.functionalTitle,
      employeeType: entry.employeeType,
      ou: entry.ou,
      lhmOULongname: entry.ouLong,
      mail: `${entry.givenName.toLowerCase()}.${entry.sn
        .toLowerCase()
        .replace(/[^a-z]/g, "")}@muenchen.de`,
      mobile: entry.mobile,
      telephoneNumber: entry.phone,
      l: entry.city,
      street: entry.street,
      roomNumber: entry.room,
      nsAccountLock: entry.locked,
    },
  };
}

const TOKEN_DETAILS: Record<string, Partial<TokenPerson>> = {
  "anna.bauer": {
    vpsx_sync: "YK_IN_SYNC",
    access: {
      PrivacyIDEA: ["fernzugriff", "admin_proxy"],
      DUO: ["fernzugriff"],
    },
    duo: {
      status: "active",
      is_enrolled: true,
      email: "anna.bauer@muenchen.de",
      last_login: ago({ hours: 3 }),
    },
    token: [
      {
        kind: "Yubikey",
        backend: "PrivacyIDEA",
        id: "PIYK0001",
        serial: "15869234",
        yk_type: "5c",
        nfcid: "04A2B3C4D5",
      },
      {
        kind: "FullWebauthncredential",
        backend: "DUO",
        id: "WAN0001",
        credential_name: "MacBook Pro Touch ID",
        label: "Platform – Touch ID",
        date_added: ago({ days: 120 }),
        date_last_used: ago({ hours: 3 }),
        registered_as: "platform",
        transports: ["internal", "hybrid"],
        passwordless_authorized: true,
      },
      {
        kind: "PushToken",
        backend: "DUO",
        id: "PUSH0001",
        activated: true,
        app_version: "4.58.0",
        os_version: "iOS 18.4",
        model: "iPhone 15 Pro",
        last_seen: ago({ hours: 5 }),
      },
    ],
  },
  "tobias.stadler": {
    vpsx_sync: "YK_IN_SYNC",
    access: { PrivacyIDEA: ["fernzugriff", "fernwartung_admin"] },
    duo: {
      status: "active",
      is_enrolled: true,
      email: "tobias.stadler@muenchen.de",
      last_login: ago({ hours: 1 }),
    },
    token: [
      {
        kind: "Yubikey",
        backend: "PrivacyIDEA",
        id: "PIYK0002",
        serial: "21044981",
        yk_type: "5",
        nfcid: "0431AABBCC",
      },
      {
        kind: "Yubikey",
        backend: "PrivacyIDEA",
        id: "PIYK0003",
        serial: "21044982",
        yk_type: "5c",
        nfcid: null,
      },
      {
        kind: "FullWebauthncredential",
        backend: "DUO",
        id: "WAN0002",
        credential_name: "YubiKey 5C NFC",
        label: "Cross-platform – Security Key",
        date_added: ago({ days: 65 }),
        date_last_used: ago({ hours: 1 }),
        registered_as: "cross-platform",
        transports: ["usb", "nfc"],
        passwordless_authorized: true,
      },
    ],
  },
  "maria.huber": {
    vpsx_sync: "OTHER_YK",
    access: { DUO: ["fernzugriff"] },
    duo: {
      status: "locked out",
      is_enrolled: true,
      email: "maria.huber@muenchen.de",
      last_login: ago({ days: 2 }),
    },
    token: [
      {
        kind: "Yubikey",
        backend: "DUO",
        id: "DYK0001",
        serial: "18230011",
        yk_type: "5",
        nfcid: "0411FF22EE",
      },
      {
        kind: "EinmalPin",
        backend: "DUO",
        id: "PIN0001",
        created: ago({ days: 1 }),
        expiration: inFuture({ days: 89 }),
        reuse_count: 1,
        value: "482910337",
      },
    ],
  },
  "josef.maier": {
    vpsx_sync: "YK_IN_SYNC",
    access: { PrivacyIDEA: ["fernzugriff", "fernwartung_extern"] },
    duo: {
      status: "active",
      is_enrolled: true,
      email: "josef.maier@muenchen.de",
      last_login: ago({ hours: 26 }),
    },
    token: [
      {
        kind: "Yubikey",
        backend: "PrivacyIDEA",
        id: "PIYK0004",
        serial: "19884412",
        yk_type: "5c",
        nfcid: "0422CC33DD",
      },
      {
        kind: "Tagespass",
        backend: "PrivacyIDEA",
        id: "TP0001",
        created: ago({ hours: 4 }),
        expiration: inFuture({ hours: 8 }),
        reuse_count: 5,
        value: "771230945",
      },
    ],
  },
  "fatima.yilmaz": {
    vpsx_sync: "NO_ENTRY",
    access: {},
    duo: {
      status: "bypass",
      is_enrolled: true,
      email: "fatima.yilmaz@muenchen.de",
      last_login: ago({ days: 5 }),
    },
    token: [
      {
        kind: "PushToken",
        backend: "DUO",
        id: "PUSH0002",
        activated: true,
        app_version: "4.57.1",
        os_version: "Android 15",
        model: "Samsung Galaxy S24",
        last_seen: ago({ days: 1 }),
      },
    ],
  },
  "lukas.wagner": {
    vpsx_sync: "YK_IN_SYNC",
    access: {
      PrivacyIDEA: ["fernwartung_admin", "admin_proxy"],
      DUO: ["fernzugriff"],
    },
    duo: {
      status: "active",
      is_enrolled: true,
      email: "lukas.wagner@muenchen.de",
      last_login: ago({ minutes: 22 }),
    },
    token: [
      {
        kind: "Yubikey",
        backend: "PrivacyIDEA",
        id: "PIYK0005",
        serial: "20551177",
        yk_type: "5c",
        nfcid: "0433DD44EE",
      },
      {
        kind: "FullWebauthncredential",
        backend: "PrivacyIDEA",
        id: "WAN0003",
        credential_name: "Windows Hello",
        label: "Platform – Windows Hello",
        date_added: ago({ days: 30 }),
        date_last_used: ago({ minutes: 22 }),
        registered_as: "platform",
        transports: ["internal"],
        passwordless_authorized: true,
      },
    ],
  },
  "sophie.fischer": {
    vpsx_sync: "NO_YK",
    access: {},
    duo: {
      status: "disabled",
      is_enrolled: false,
      email: "sophie.fischer@muenchen.de",
      last_login: ago({ days: 45 }),
    },
    token: [],
  },
  "michael.koch": {
    vpsx_sync: "YK_IN_SYNC",
    access: { DUO: ["fernzugriff"] },
    duo: {
      status: "active",
      is_enrolled: true,
      email: "michael.koch@muenchen.de",
      last_login: ago({ hours: 9 }),
    },
    token: [
      {
        kind: "Yubikey",
        backend: "DUO",
        id: "DYK0002",
        serial: "17660098",
        yk_type: "5",
        nfcid: "0444EE55FF",
      },
    ],
  },
};

const FACTORS = [
  "duo_push",
  "yubikey_passcode",
  "WebAuthn Security Key",
  "WebAuthn Chrome Touch ID",
  "passcode",
  "bypass_code",
];
const APPS = [
  "M365 / Entra ID",
  "VPN Fernzugriff",
  "Admin-Proxy",
  "RemoteApp Portal",
  "VDI Arbeitsplatz",
];

function buildAuthlogs(seed: number): TokenPerson["authlogs"] {
  const entries: TokenPerson["authlogs"] = [];
  for (let i = 0; i < 8; i++) {
    const success = (seed + i) % 4 !== 0;
    entries.push({
      backend: (seed + i) % 2 === 0 ? "DUO" : "PrivacyIDEA",
      timestamp: ago({ hours: i * 6 + seed, minutes: (i * 7) % 60 }),
      application_name: APPS[(seed + i) % APPS.length] ?? "VPN Fernzugriff",
      event_type: "authentication",
      result: success ? "success" : i % 2 === 0 ? "denied" : "failure",
      reason: success ? null : "Falscher Faktor / Timeout",
      factor: FACTORS[(seed + i) % FACTORS.length] ?? "duo_push",
    });
  }
  return entries;
}

export const TOKEN_PEOPLE: TokenPerson[] = DIRECTORY.map((entry, idx) => {
  const detail = TOKEN_DETAILS[entry.username];
  return {
    ...buildCore(entry),
    duo: detail?.duo ?? null,
    access: detail?.access ?? {},
    token: detail?.token ?? [],
    authlogs: buildAuthlogs(idx + 1),
    vpsx_sync: detail?.vpsx_sync ?? "NO_ENTRY",
  } satisfies TokenPerson;
});

const FES_DETAILS: Record<string, Partial<FesPerson>> = {
  "anna.bauer": {
    is_enabled: true,
    is_ra_admin: true,
    computers: ["LHM-RIT-NB-0451", "LHM-RIT-WS-1120"],
    signing_certs: [
      {
        serial: "5A:0F:23:91:CC:01",
        request_id: 88231,
        requester: "anna.bauer",
        cn: "Anna Bauer (Signatur)",
        cert_template: "LHM-FES-Signatur",
        disposition: 20,
      },
    ],
    ra_enrollment_certs: [
      {
        serial: "5A:0F:23:91:CC:09",
        request_id: 88240,
        requester: "anna.bauer",
        cn: "Anna Bauer (RA-Admin)",
        cert_template: "LHM-FES-RA-Admin",
        disposition: 20,
      },
    ],
    software_installs: [
      {
        product: "SecSigner",
        version: "6.5.2",
        up_to_date_version: "6.5.2",
        client: "LHM-RIT-NB-0451",
        last_heartbeat: ago({ hours: 2 }),
      },
    ],
  },
  "tobias.stadler": {
    is_enabled: true,
    is_ra_admin: false,
    computers: ["LHM-RIT-NB-0982"],
    signing_certs: [
      {
        serial: "5A:0F:23:91:CD:14",
        request_id: 88512,
        requester: "tobias.stadler",
        cn: "Tobias Stadler (Signatur)",
        cert_template: "LHM-FES-Signatur",
        disposition: 20,
      },
    ],
    ra_enrollment_certs: [],
    software_installs: [
      {
        product: "SecSigner",
        version: "6.4.0",
        up_to_date_version: "6.5.2",
        client: "LHM-RIT-NB-0982",
        last_heartbeat: ago({ hours: 1 }),
      },
    ],
  },
  "fatima.yilmaz": {
    is_enabled: true,
    is_ra_admin: false,
    computers: ["LHM-BAU-NB-0233"],
    signing_certs: [
      {
        serial: "5A:0F:24:00:11:77",
        request_id: 89001,
        requester: "fatima.yilmaz",
        cn: "Fatima Yılmaz (Signatur)",
        cert_template: "LHM-FES-Signatur",
        disposition: 20,
      },
      {
        serial: "5A:0F:23:88:00:01",
        request_id: 81020,
        requester: "fatima.yilmaz",
        cn: "Fatima Yılmaz (Signatur, alt)",
        cert_template: "LHM-FES-Signatur",
        disposition: 21,
      },
    ],
    ra_enrollment_certs: [],
    software_installs: [
      {
        product: "SecSigner",
        version: "6.5.2",
        up_to_date_version: "6.5.2",
        client: "LHM-BAU-NB-0233",
        last_heartbeat: ago({ days: 3 }),
      },
    ],
  },
  "michael.koch": {
    is_enabled: true,
    is_ra_admin: true,
    computers: ["LHM-POR-WS-0044"],
    signing_certs: [
      {
        serial: "5A:0F:24:10:42:AB",
        request_id: 89233,
        requester: "michael.koch",
        cn: "Michael Koch (Signatur)",
        cert_template: "LHM-FES-Signatur",
        disposition: 20,
      },
    ],
    ra_enrollment_certs: [
      {
        serial: "5A:0F:24:10:42:B0",
        request_id: 89240,
        requester: "michael.koch",
        cn: "Michael Koch (RA-Admin)",
        cert_template: "LHM-FES-RA-Admin",
        disposition: 20,
      },
    ],
    software_installs: [],
  },
};

export const FES_PEOPLE: FesPerson[] = DIRECTORY.map((entry) => {
  const detail = FES_DETAILS[entry.username];
  return {
    ...buildCore(entry),
    is_enabled: detail?.is_enabled ?? false,
    is_ra_admin: detail?.is_ra_admin ?? false,
    signing_certs: detail?.signing_certs ?? [],
    ra_enrollment_certs: detail?.ra_enrollment_certs ?? [],
    software_installs: detail?.software_installs ?? [],
    computers: detail?.computers ?? [],
  } satisfies FesPerson;
});
