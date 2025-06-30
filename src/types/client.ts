import { UserRoleType } from ".";
import { Tables } from "./supabase";

export type ClientTypeWithRole = Tables<'users'> & {
  user_roles:  {
    role: UserRoleType
  }
}

export type ClientType = Tables<"users">;