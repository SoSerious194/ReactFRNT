// TypeScript interfaces for meal plan data

export interface MealPlanDay {
  id?: string;
  meal_plan_id: string;
  week_number: number; // 1-4
  day_number: number; // 1-7 (Monday-Sunday)
  created_at?: string;
}

export interface MealPlanMeal {
  id?: string;
  meal_plan_day_id: string;
  meal_type: "breakfast" | "lunch" | "dinner";
  recipe_id: string | null;
  created_at?: string;
}

export interface MealPlan {
  id?: string;
  coach_id: string;
  title: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserMealPlan {
  id?: string;
  user_id: string | null; // null for "all users"
  meal_plan_id: string;
  assigned_by: string;
  assigned_at?: string;
  is_active?: boolean;
}

// Frontend data structures for the UI
export interface MealPlanBuilderData {
  title: string;
  description: string;
  userSelectionMode: "all" | "individual";
  selectedUsers: string[];
  weekData: WeekMealData[];
}

export interface WeekMealData {
  week: number; // 1-4
  days: DayMealData[];
}

export interface DayMealData {
  dayNumber: number; // 1-7
  meals: MealSlotData[];
}

export interface MealSlotData {
  mealType: "breakfast" | "lunch" | "dinner";
  recipeId: string | null;
}

// Conversion helpers
export interface CreateMealPlanRequest {
  mealPlan: Omit<MealPlan, "id" | "created_at" | "updated_at">;
  userSelectionMode: "all" | "individual";
  selectedUsers: string[];
  mealData: WeekMealData[];
}

export interface UpdateMealPlanRequest {
  id: string;
  mealPlan: Partial<Omit<MealPlan, "id" | "coach_id" | "created_at">>;
  userSelectionMode: "all" | "individual";
  selectedUsers: string[];
  mealData: WeekMealData[];
}

// Database view types
export interface UserActiveMealPlan {
  user_id: string | null;
  full_name: string | null;
  email: string | null;
  meal_plan_id: string | null;
  title: string | null;
  description: string | null;
  assigned_at: string | null;
  assigned_by: string | null;
}

export interface MealPlanComplete {
  meal_plan_id: string | null;
  coach_id: string | null;
  title: string | null;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  week_number: number | null;
  day_number: number | null;
  meal_type: string | null;
  recipe_id: string | null;
  recipe_name: string | null;
  total_calories: number | null;
  total_protein: number | null;
  total_carbs: number | null;
  total_fat: number | null;
}
