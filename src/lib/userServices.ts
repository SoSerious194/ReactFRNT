import { createClient } from "@/utils/supabase/client";

export interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  role: string | null;
  coach: string | null;
  created_at: string | null;
}

export class UserService {
  private static supabase = createClient();

  /**
   * Get all users assigned to the current coach
   */
  static async getCoachClients(): Promise<User[]> {
    try {
      // Get current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await this.supabase.auth.getUser();

      if (userError || !currentUser) {
        throw new Error("No authenticated user found");
      }

      // Fetch users where coach matches current user's ID
      const { data: users, error } = await this.supabase
        .from("users")
        .select(
          `
          id,
          full_name,
          email,
          profile_image_url,
          role,
          coach,
          created_at
        `
        )
        .eq("coach", currentUser.id)
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching coach clients:", error);
        throw error;
      }

      return users || [];
    } catch (error) {
      console.error("Failed to fetch coach clients:", error);
      throw error;
    }
  }

  /**
   * Get all users in the organization (for "all users" mode)
   */
  static async getAllUsers(): Promise<User[]> {
    try {
      // Get current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await this.supabase.auth.getUser();

      if (userError || !currentUser) {
        throw new Error("No authenticated user found");
      }

      // Fetch all users (you might want to add workspace filtering here)
      const { data: users, error } = await this.supabase
        .from("users")
        .select(
          `
          id,
          full_name,
          email,
          profile_image_url,
          role,
          coach,
          created_at
        `
        )
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching all users:", error);
        throw error;
      }

      return users || [];
    } catch (error) {
      console.error("Failed to fetch all users:", error);
      throw error;
    }
  }

  /**
   * Search users by name
   */
  static async searchUsers(query: string): Promise<User[]> {
    try {
      // Get current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await this.supabase.auth.getUser();

      if (userError || !currentUser) {
        throw new Error("No authenticated user found");
      }

      if (!query.trim()) {
        return this.getCoachClients();
      }

      // Search users by name where coach matches current user
      const { data: users, error } = await this.supabase
        .from("users")
        .select(
          `
          id,
          full_name,
          email,
          profile_image_url,
          role,
          coach,
          created_at
        `
        )
        .eq("coach", currentUser.id)
        .ilike("full_name", `%${query}%`)
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error searching users:", error);
        throw error;
      }

      return users || [];
    } catch (error) {
      console.error("Failed to search users:", error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await this.supabase
        .from("users")
        .select(
          `
          id,
          full_name,
          email,
          profile_image_url,
          role,
          coach,
          created_at
        `
        )
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user by ID:", error);
        throw error;
      }

      return user;
    } catch (error) {
      console.error("Failed to fetch user by ID:", error);
      return null;
    }
  }

  /**
   * Get multiple users by IDs
   */
  static async getUsersByIds(userIds: string[]): Promise<User[]> {
    try {
      if (userIds.length === 0) {
        return [];
      }

      const { data: users, error } = await this.supabase
        .from("users")
        .select(
          `
          id,
          full_name,
          email,
          profile_image_url,
          role,
          coach,
          created_at
        `
        )
        .in("id", userIds)
        .order("full_name", { ascending: true });

      if (error) {
        console.error("Error fetching users by IDs:", error);
        throw error;
      }

      return users || [];
    } catch (error) {
      console.error("Failed to fetch users by IDs:", error);
      return [];
    }
  }

  /**
   * Get current coach info
   */
  static async getCurrentCoach(): Promise<User | null> {
    try {
      // Get current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await this.supabase.auth.getUser();

      if (userError || !currentUser) {
        throw new Error("No authenticated user found");
      }

      const { data: coach, error } = await this.supabase
        .from("users")
        .select(
          `
          id,
          full_name,
          email,
          profile_image_url,
          role,
          coach,
          created_at
        `
        )
        .eq("id", currentUser.id)
        .single();

      if (error) {
        console.error("Error fetching current coach:", error);
        return null;
      }

      return coach;
    } catch (error) {
      console.error("Failed to fetch current coach:", error);
      return null;
    }
  }
}
