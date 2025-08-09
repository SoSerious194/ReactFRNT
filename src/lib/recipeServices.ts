import { createClient } from "@/utils/supabase/client";
import { Recipe, CreateRecipeData, UpdateRecipeData } from "@/types/recipe";

const supabase = createClient();

export class RecipeService {
  /**
   * Create a new recipe
   */
  static async createRecipe(recipeData: CreateRecipeData): Promise<Recipe> {
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          coach_id: user.id,
          name: recipeData.name,
          short_description: recipeData.short_description,
          description: recipeData.description,
          servings: recipeData.servings,
          prep_time: recipeData.prep_time || 0,
          cook_time: recipeData.cook_time || 0,
          difficulty: recipeData.difficulty || "Beginner",
          meal_type: recipeData.meal_type || "breakfast",
          dietary_tag: recipeData.dietary_tag,
          cover_photo: recipeData.cover_photo,
          image_url: recipeData.image_url,
          video_url: recipeData.video_url,
          tags: recipeData.tags || [],
          instructions: recipeData.instructions,
          ingredients: recipeData.ingredients,
          total_calories: recipeData.total_calories,
          total_protein: recipeData.total_protein,
          total_carbs: recipeData.total_carbs,
          total_fat: recipeData.total_fat,
          is_public: recipeData.is_public || false,
        })
        .select()
        .single();

      if (recipeError) {
        throw new Error(`Failed to create recipe: ${recipeError.message}`);
      }

      return recipe;
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  }

  /**
   * Get a recipe by ID
   */
  static async getRecipeById(id: string): Promise<Recipe> {
    const { data: recipe, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch recipe: ${error.message}`);
    }

    return recipe;
  }

  /**
   * Get all recipes for the current user
   */
  static async getUserRecipes(): Promise<Recipe[]> {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("coach_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recipes: ${error.message}`);
    }

    return recipes || [];
  }

  /**
   * Get public recipes (accessible by all users)
   */
  static async getPublicRecipes(): Promise<Recipe[]> {
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch public recipes: ${error.message}`);
    }

    return recipes || [];
  }

  /**
   * Update a recipe
   */
  static async updateRecipe(
    id: string,
    updates: UpdateRecipeData
  ): Promise<Recipe> {
    try {
      const { data: recipe, error } = await supabase
        .from("recipes")
        .update({
          name: updates.name,
          short_description: updates.short_description,
          description: updates.description,
          servings: updates.servings,
          prep_time: updates.prep_time,
          cook_time: updates.cook_time,
          difficulty: updates.difficulty,
          meal_type: updates.meal_type,
          dietary_tag: updates.dietary_tag,
          cover_photo: updates.cover_photo,
          image_url: updates.image_url,
          video_url: updates.video_url,
          tags: updates.tags,
          instructions: updates.instructions,
          ingredients: updates.ingredients,
          total_calories: updates.total_calories,
          total_protein: updates.total_protein,
          total_carbs: updates.total_carbs,
          total_fat: updates.total_fat,
          is_public: updates.is_public,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update recipe: ${error.message}`);
      }

      return recipe;
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  }

  /**
   * Delete a recipe and all related data
   */
  static async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase.from("recipes").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete recipe: ${error.message}`);
    }
  }

  /**
   * Search recipes by name or description
   */
  static async searchRecipes(query: string): Promise<Recipe[]> {
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*")
      .or(`name.ilike.%${query}%, short_description.ilike.%${query}%`)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to search recipes: ${error.message}`);
    }

    return recipes || [];
  }

  /**
   * Get recipes by meal type
   */
  static async getRecipesByMealType(mealType: string): Promise<Recipe[]> {
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("meal_type", mealType)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recipes: ${error.message}`);
    }

    return recipes || [];
  }

  /**
   * Get recipes by dietary tag
   */
  static async getRecipesByDietaryTag(dietaryTag: string): Promise<Recipe[]> {
    const { data: recipes, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("dietary_tag", dietaryTag)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recipes: ${error.message}`);
    }

    return recipes || [];
  }

  /**
   * Toggle recipe visibility (public/private)
   */
  static async toggleRecipeVisibility(
    id: string,
    isPublic: boolean
  ): Promise<Recipe> {
    const { data: recipe, error } = await supabase
      .from("recipes")
      .update({ is_public: isPublic })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update recipe visibility: ${error.message}`);
    }

    return recipe;
  }
}
