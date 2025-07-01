"use server";

import { USER_ROLES } from "@/lib/constant";
import { createClient } from "@/utils/supabase/server";

export const getClients = async () => {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.from("users").select("*, user_roles!inner(role)").eq("user_roles.role", USER_ROLES.CLIENT).order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return {
      data: data,
      success: true,
      message: "Clients fetched successfully",
    };
  } catch (error) {
    console.error("Error in getClients:", error);
    return {
      data: [],
      success: false,
      message: "Failed to fetch clients",
    };
  }
};
