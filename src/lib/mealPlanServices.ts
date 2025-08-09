import { createClient } from "@/utils/supabase/client";
import {
  MealPlan,
  MealPlanDay,
  MealPlanMeal,
  UserMealPlan,
  CreateMealPlanRequest,
  UpdateMealPlanRequest,
  WeekMealData,
  UserActiveMealPlan,
  MealPlanComplete,
} from "@/types/mealPlan";

export class MealPlanService {
  private static supabase = createClient();

  /**
   * Create a new meal plan with all related data
   */
  static async createMealPlan(request: CreateMealPlanRequest): Promise<string> {
    const { mealPlan, userSelectionMode, selectedUsers, mealData } = request;

    try {
      // Start transaction-like operations
      // 1. Create the meal plan
      const { data: createdMealPlan, error: mealPlanError } =
        await this.supabase
          .from("meal_plans")
          .insert([mealPlan])
          .select("id")
          .single();

      if (mealPlanError) throw mealPlanError;
      if (!createdMealPlan) throw new Error("Failed to create meal plan");

      const mealPlanId = createdMealPlan.id;

      // 2. Create meal plan days (4 weeks × 7 days = 28 days)
      const daysToInsert: Omit<MealPlanDay, "id" | "created_at">[] = [];
      for (let week = 1; week <= 4; week++) {
        for (let day = 1; day <= 7; day++) {
          daysToInsert.push({
            meal_plan_id: mealPlanId,
            week_number: week,
            day_number: day,
          });
        }
      }

      const { data: createdDays, error: daysError } = await this.supabase
        .from("meal_plan_days")
        .insert(daysToInsert)
        .select("id, week_number, day_number");

      if (daysError) throw daysError;
      if (!createdDays) throw new Error("Failed to create meal plan days");

      // 3. Create meal plan meals based on the UI data
      const mealsToInsert: Omit<MealPlanMeal, "id" | "created_at">[] = [];

      mealData.forEach((weekData) => {
        weekData.days.forEach((dayData) => {
          // Find the corresponding day ID from created days
          const dayRecord = createdDays.find(
            (d) =>
              d.week_number === weekData.week &&
              d.day_number === dayData.dayNumber
          );

          if (dayRecord) {
            dayData.meals.forEach((meal) => {
              if (meal.recipeId) {
                // Only create meals that have recipes assigned
                mealsToInsert.push({
                  meal_plan_day_id: dayRecord.id,
                  meal_type: meal.mealType,
                  recipe_id: meal.recipeId,
                });
              }
            });
          }
        });
      });

      if (mealsToInsert.length > 0) {
        const { error: mealsError } = await this.supabase
          .from("meal_plan_meals")
          .insert(mealsToInsert);

        if (mealsError) throw mealsError;
      }

      // 4. Assign meal plan to users
      await this.assignMealPlanToUsers(
        mealPlanId,
        userSelectionMode,
        selectedUsers,
        mealPlan.coach_id
      );

      return mealPlanId;
    } catch (error) {
      console.error("Error creating meal plan:", error);
      throw error;
    }
  }

  /**
   * Update an existing meal plan
   */
  static async updateMealPlan(request: UpdateMealPlanRequest): Promise<void> {
    const { id, mealPlan, userSelectionMode, selectedUsers, mealData } =
      request;

    try {
      // 1. Update meal plan basic info
      const { error: updateError } = await this.supabase
        .from("meal_plans")
        .update(mealPlan)
        .eq("id", id);

      if (updateError) throw updateError;

      // 2. Get existing meal plan days
      const { data: existingDays, error: daysError } = await this.supabase
        .from("meal_plan_days")
        .select("id, week_number, day_number")
        .eq("meal_plan_id", id);

      if (daysError) throw daysError;

      // 3. Delete existing meals and recreate them
      if (existingDays && existingDays.length > 0) {
        const dayIds = existingDays.map((d) => d.id);
        const { error: deleteMealsError } = await this.supabase
          .from("meal_plan_meals")
          .delete()
          .in("meal_plan_day_id", dayIds);

        if (deleteMealsError) throw deleteMealsError;
      }

      // 4. Create new meals based on updated data
      const mealsToInsert: Omit<MealPlanMeal, "id" | "created_at">[] = [];

      mealData.forEach((weekData) => {
        weekData.days.forEach((dayData) => {
          const dayRecord = existingDays?.find(
            (d) =>
              d.week_number === weekData.week &&
              d.day_number === dayData.dayNumber
          );

          if (dayRecord) {
            dayData.meals.forEach((meal) => {
              if (meal.recipeId) {
                mealsToInsert.push({
                  meal_plan_day_id: dayRecord.id,
                  meal_type: meal.mealType,
                  recipe_id: meal.recipeId,
                });
              }
            });
          }
        });
      });

      if (mealsToInsert.length > 0) {
        const { error: mealsError } = await this.supabase
          .from("meal_plan_meals")
          .insert(mealsToInsert);

        if (mealsError) throw mealsError;
      }

      // 5. Update user assignments
      // First, get the coach_id from the meal plan
      const { data: mealPlanData, error: getMealPlanError } =
        await this.supabase
          .from("meal_plans")
          .select("coach_id")
          .eq("id", id)
          .single();

      if (getMealPlanError) throw getMealPlanError;

      // Delete existing assignments and recreate
      const { error: deleteAssignmentsError } = await this.supabase
        .from("user_meal_plans")
        .delete()
        .eq("meal_plan_id", id);

      if (deleteAssignmentsError) throw deleteAssignmentsError;

      await this.assignMealPlanToUsers(
        id,
        userSelectionMode,
        selectedUsers,
        mealPlanData.coach_id
      );
    } catch (error) {
      console.error("Error updating meal plan:", error);
      throw error;
    }
  }

  /**
   * Helper function to assign meal plan to users
   */
  private static async assignMealPlanToUsers(
    mealPlanId: string,
    userSelectionMode: "all" | "individual",
    selectedUsers: string[],
    coachId: string
  ): Promise<void> {
    const assignmentsToInsert: Omit<UserMealPlan, "id" | "assigned_at">[] = [];

    if (userSelectionMode === "all") {
      // Create one assignment with user_id = null for "all users"
      assignmentsToInsert.push({
        user_id: null,
        meal_plan_id: mealPlanId,
        assigned_by: coachId,
        is_active: true,
      });
    } else {
      // Create individual assignments for selected users
      selectedUsers.forEach((userId) => {
        assignmentsToInsert.push({
          user_id: userId,
          meal_plan_id: mealPlanId,
          assigned_by: coachId,
          is_active: true,
        });
      });
    }

    if (assignmentsToInsert.length > 0) {
      const { error: assignError } = await this.supabase
        .from("user_meal_plans")
        .insert(assignmentsToInsert);

      if (assignError) throw assignError;
    }
  }

  /**
   * Get meal plans created by the current coach with user assignment counts
   */
  static async getCoachMealPlans(): Promise<
    (MealPlan & { assignedUserCount?: number; assignedToAll?: boolean })[]
  > {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Get meal plans
    const { data: mealPlans, error } = await this.supabase
      .from("meal_plans")
      .select("*")
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!mealPlans) return [];

    // Get user assignments for all meal plans
    const mealPlanIds = mealPlans.map((plan) => plan.id);
    const { data: assignments, error: assignmentsError } = await this.supabase
      .from("user_meal_plans")
      .select("meal_plan_id, user_id")
      .in("meal_plan_id", mealPlanIds)
      .eq("is_active", true);

    if (assignmentsError) throw assignmentsError;

    // Add assignment info to meal plans
    return mealPlans.map((plan) => {
      const planAssignments =
        assignments?.filter((a) => a.meal_plan_id === plan.id) || [];
      const assignedToAll = planAssignments.some((a) => a.user_id === null);
      const assignedUserCount = assignedToAll ? 0 : planAssignments.length;

      return {
        ...plan,
        assignedUserCount,
        assignedToAll,
      };
    });
  }

  /**
   * Get a specific meal plan with all its data
   */
  static async getMealPlanById(id: string): Promise<MealPlanComplete[]> {
    const { data, error } = await this.supabase
      .from("meal_plan_complete")
      .select("*")
      .eq("meal_plan_id", id)
      .order("week_number", { ascending: true })
      .order("day_number", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get users assigned to a specific meal plan
   */
  static async getMealPlanUsers(
    mealPlanId: string
  ): Promise<UserActiveMealPlan[]> {
    // Query user_meal_plans directly to ensure we get NULL user_id records (All Users assignments)
    const { data, error } = await this.supabase
      .from("user_meal_plans")
      .select("*")
      .eq("meal_plan_id", mealPlanId)
      .eq("is_active", true);

    if (error) throw error;

    // For records with actual user_ids, get user details separately
    const userIds = (data || [])
      .filter((record) => record.user_id !== null)
      .map((record) => record.user_id!);

    let usersMap = new Map();
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await this.supabase
        .from("users")
        .select("id, full_name, email")
        .in("id", userIds);

      if (usersError) throw usersError;

      users?.forEach((user) => {
        usersMap.set(user.id, user);
      });
    }

    // Transform to match UserActiveMealPlan interface
    return (data || []).map((record) => {
      const user = record.user_id ? usersMap.get(record.user_id) : null;
      return {
        assigned_at: record.assigned_at,
        assigned_by: record.assigned_by,
        description: null, // Not available in user_meal_plans
        email: user?.email || null,
        full_name: user?.full_name || null,
        meal_plan_id: record.meal_plan_id,
        title: null, // Not available in user_meal_plans
        user_id: record.user_id,
      };
    });
  }

  /**
   * Delete a meal plan and all related data
   */
  static async deleteMealPlan(id: string): Promise<void> {
    try {
      // Delete in reverse order due to foreign key constraints
      // 1. Delete user assignments
      const { error: deleteAssignmentsError } = await this.supabase
        .from("user_meal_plans")
        .delete()
        .eq("meal_plan_id", id);

      if (deleteAssignmentsError) throw deleteAssignmentsError;

      // 2. Delete meals (cascade should handle this, but being explicit)
      const { data: days } = await this.supabase
        .from("meal_plan_days")
        .select("id")
        .eq("meal_plan_id", id);

      if (days && days.length > 0) {
        const dayIds = days.map((d) => d.id);
        const { error: deleteMealsError } = await this.supabase
          .from("meal_plan_meals")
          .delete()
          .in("meal_plan_day_id", dayIds);

        if (deleteMealsError) throw deleteMealsError;
      }

      // 3. Delete days
      const { error: deleteDaysError } = await this.supabase
        .from("meal_plan_days")
        .delete()
        .eq("meal_plan_id", id);

      if (deleteDaysError) throw deleteDaysError;

      // 4. Finally delete the meal plan
      const { error: deleteMealPlanError } = await this.supabase
        .from("meal_plans")
        .delete()
        .eq("id", id);

      if (deleteMealPlanError) throw deleteMealPlanError;
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      throw error;
    }
  }

  /**
   * Check if a user already has an active meal plan
   */
  static async checkUserHasMealPlan(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("user_meal_plans")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(1);

    if (error) throw error;
    return (data && data.length > 0) || false;
  }

  /**
   * Validate if selected users can be assigned a meal plan
   */
  static async validateUserAssignments(userIds: string[]): Promise<{
    valid: boolean;
    usersWithPlans: string[];
  }> {
    const { data, error } = await this.supabase
      .from("user_meal_plans")
      .select("user_id")
      .in("user_id", userIds)
      .eq("is_active", true);

    if (error) throw error;

    const usersWithPlans = data?.map((d) => d.user_id).filter(Boolean) || [];

    return {
      valid: usersWithPlans.length === 0,
      usersWithPlans,
    };
  }
}
