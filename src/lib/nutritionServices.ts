import { createClient } from "@/utils/supabase/client";

export interface LoggedFoodItem {
  food_item_id?: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  nutritionix_id?: string;
}

export interface CreateNutritionLogData {
  client_id: string;
  coach_id: string;
  log_date: string;
  meal_type: string;
  food_items: LoggedFoodItem[];
  notes?: string;
}

export interface NutritionixSearchResponse {
  common: Array<{
    food_name: string;
    serving_unit: string;
    tag_name?: string;
    tag_id?: string;
    photo?: {
      thumb: string;
    };
  }>;
  branded: Array<{
    food_name: string;
    serving_unit: string;
    nix_brand_id?: string;
    brand_name?: string;
    nix_item_id?: string;
    photo?: {
      thumb: string;
    };
  }>;
}

export interface NutritionixNaturalResponse {
  foods: Array<{
    food_name: string;
    serving_qty: number;
    serving_unit: string;
    nix_brand_id?: string;
    brand_name?: string;
    nix_item_id?: string;
    photo?: {
      thumb: string;
    };
    full_nutrients: Array<{
      attr_id: number;
      value: number;
    }>;
    alt_measures?: Array<{
      serving_weight: number;
      measure: string;
      seq: number;
      qty: number;
    }>;
  }>;
}

export class NutritionService {
  private supabase;
  private nutritionixAppId: string;
  private nutritionixAppKey: string;

  constructor() {
    this.supabase = createClient();
    this.nutritionixAppId = process.env.NEXT_PUBLIC_NUTRITIONIX_APP_ID || "";
    this.nutritionixAppKey = process.env.NEXT_PUBLIC_NUTRITIONIX_APP_KEY || "";
  }

  // Search for foods using Nutritionix Instant API
  async searchFoods(query: string): Promise<NutritionixSearchResponse> {
    try {
      const response = await fetch(
        `https://trackapi.nutritionix.com/v2/search/instant?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "x-app-id": this.nutritionixAppId,
            "x-app-key": this.nutritionixAppKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Nutritionix API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error searching foods:", error);
      throw error;
    }
  }

  // Parse natural language using Nutritionix Natural API
  async parseNaturalLanguage(query: string): Promise<NutritionixNaturalResponse> {
    try {
      const response = await fetch(
        "https://trackapi.nutritionix.com/v2/natural/nutrients",
        {
          method: "POST",
          headers: {
            "x-app-id": this.nutritionixAppId,
            "x-app-key": this.nutritionixAppKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: query,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Nutritionix API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error parsing natural language:", error);
      throw error;
    }
  }

  // Create nutrition log
  async createNutritionLog(data: CreateNutritionLogData) {
    try {
      // Calculate totals
      const totalCalories = data.food_items.reduce((sum, item) => sum + item.calories, 0);
      const totalProtein = data.food_items.reduce((sum, item) => sum + item.protein, 0);
      const totalCarbs = data.food_items.reduce((sum, item) => sum + item.carbs, 0);
      const totalFat = data.food_items.reduce((sum, item) => sum + item.fat, 0);

      const { data: log, error } = await this.supabase
        .from("nutrition_logs")
        .insert({
          client_id: data.client_id,
          coach_id: data.coach_id,
          log_date: data.log_date,
          meal_type: data.meal_type,
          food_items: data.food_items,
          total_calories: totalCalories,
          total_protein: totalProtein,
          total_carbs: totalCarbs,
          total_fat: totalFat,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating nutrition log:", error);
        return null;
      }

      return log;
    } catch (error) {
      console.error("Error creating nutrition log:", error);
      return null;
    }
  }

  // Get nutrition logs for a client
  async getClientNutritionLogs(clientId: string, startDate?: string, endDate?: string) {
    try {
      let query = this.supabase
        .from("nutrition_logs")
        .select("*")
        .eq("client_id", clientId)
        .order("log_date", { ascending: false });

      if (startDate) {
        query = query.gte("log_date", startDate);
      }
      if (endDate) {
        query = query.lte("log_date", endDate);
      }

      const { data: logs, error } = await query;

      if (error) {
        console.error("Error fetching nutrition logs:", error);
        return [];
      }

      return logs;
    } catch (error) {
      console.error("Error fetching nutrition logs:", error);
      return [];
    }
  }

  // Create water log
  async createWaterLog(clientId: string, coachId: string, logDate: string, amountMl: number) {
    try {
      const { data: log, error } = await this.supabase
        .from("water_logs")
        .insert({
          client_id: clientId,
          coach_id: coachId,
          log_date: logDate,
          amount_ml: amountMl,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating water log:", error);
        return null;
      }

      return log;
    } catch (error) {
      console.error("Error creating water log:", error);
      return null;
    }
  }

  // Get water logs for a client
  async getClientWaterLogs(clientId: string, startDate?: string, endDate?: string) {
    try {
      let query = this.supabase
        .from("water_logs")
        .select("*")
        .eq("client_id", clientId)
        .order("log_date", { ascending: false });

      if (startDate) {
        query = query.gte("log_date", startDate);
      }
      if (endDate) {
        query = query.lte("log_date", endDate);
      }

      const { data: logs, error } = await query;

      if (error) {
        console.error("Error fetching water logs:", error);
        return [];
      }

      return logs;
    } catch (error) {
      console.error("Error fetching water logs:", error);
      return [];
    }
  }

  // Convert Nutritionix food to LoggedFoodItem
  convertNutritionixFoodToLoggedItem(nutritionixFood: any, quantity: number = 1): LoggedFoodItem {
    const calories = nutritionixFood.full_nutrients?.find((n: any) => n.attr_id === 208)?.value || 0;
    const protein = nutritionixFood.full_nutrients?.find((n: any) => n.attr_id === 203)?.value || 0;
    const carbs = nutritionixFood.full_nutrients?.find((n: any) => n.attr_id === 205)?.value || 0;
    const fat = nutritionixFood.full_nutrients?.find((n: any) => n.attr_id === 204)?.value || 0;

    return {
      food_name: nutritionixFood.food_name,
      quantity: quantity,
      unit: nutritionixFood.serving_unit,
      calories: Math.round(calories * quantity),
      protein: Math.round(protein * quantity * 10) / 10,
      carbs: Math.round(carbs * quantity * 10) / 10,
      fat: Math.round(fat * quantity * 10) / 10,
      nutritionix_id: nutritionixFood.nix_item_id,
    };
  }

  // Calculate daily totals from logs
  calculateDailyTotals(logs: any[]) {
    return logs.reduce(
      (totals, log) => ({
        calories: totals.calories + (log.total_calories || 0),
        protein: totals.protein + (log.total_protein || 0),
        carbs: totals.carbs + (log.total_carbs || 0),
        fat: totals.fat + (log.total_fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }
} 