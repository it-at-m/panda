import type { UserInfo } from "@/types/UserInfo";

import { defineStore } from "pinia";
import { computed, readonly, ref } from "vue";

import { getUserInfo } from "@/api/userinfo-client";
import { Role } from "@/types/Role";

function isRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role);
}

const DEMO_USER: UserInfo = {
  sub: "demo-anna-bauer",
  preferred_username: "anna.bauer",
  name: "Dr. Anna Bauer",
  given_name: "Anna",
  family_name: "Bauer",
  email: "anna.bauer@muenchen.de",
  phone_number: "+49 89 233-45010",
  department: "RIT",
  lhmObjectID: "1004523",
  resource_access: {
    "panda-admin": { roles: ["reader", "writer"] },
  },
};

export const useUserInfoStore = defineStore("userInfo", () => {
  const internalUserInfo = ref<UserInfo | null>(null);
  const userInfo = readonly(internalUserInfo);

  async function fetchUserInfo(): Promise<void> {
    try {
      internalUserInfo.value = await getUserInfo();
    } catch {
      // Demo fallback: no backend available, use a fictional administrator so
      // the pitch demo works fully offline.
      internalUserInfo.value = DEMO_USER;
    }
  }

  const currentRoles = computed(() => {
    const allUserInfoRoles =
      Object.values(internalUserInfo.value?.resource_access ?? {})[0]?.roles ??
      [];
    return allUserInfoRoles.filter(isRole);
  });

  return { userInfo, currentRoles, fetchUserInfo };
});
