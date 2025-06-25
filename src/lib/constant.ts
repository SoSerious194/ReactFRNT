import { UserRoleType } from "@/types";

export const USER_ROLES: Record<string, UserRoleType> = {
  CLIENT: 'Client' ,
  COACH: 'Coach',
} as const;


