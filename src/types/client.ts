import { UserRoleType } from ".";
import { Tables } from "./supabase";

export type ClientType = Tables<'users'> & {
  user_roles:  {
    role: UserRoleType
  }
}

