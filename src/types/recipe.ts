// TypeScript interfaces for simplified Recipe schema

export type DifficultyLevel = "Beginner" | "Intermediate" | "Advanced";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type DietaryTag =
  | "High Protein"
  | "Antioxidants"
  | "Low Carb"
  | "Heart Healthy"
  | "Anti-Inflammatory"
  | "Fiber Rich";

export interface RecipeIngredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugars?: number;
  sodium?: number;
}

export interface Recipe {
  id: string;
  coach_id: string;
  name: string;
  short_description?: string;
  description?: string;
  servings: number;
  prep_time: number; // in minutes
  cook_time: number; // in minutes
  difficulty: DifficultyLevel;
  meal_type: MealType;
  dietary_tag?: DietaryTag;
  cover_photo?: string;
  image_url?: string;
  video_url?: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  tags: string[];
  instructions: string[];
  ingredients: RecipeIngredient[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// For creating/updating recipes
export interface CreateRecipeData {
  name: string;
  short_description?: string;
  description?: string;
  servings: number;
  prep_time?: number;
  cook_time?: number;
  difficulty?: DifficultyLevel;
  meal_type?: MealType;
  dietary_tag?: DietaryTag;
  cover_photo?: string;
  image_url?: string;
  video_url?: string;
  tags?: string[];
  instructions: string[];
  ingredients: RecipeIngredient[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  is_public?: boolean;
}

export interface UpdateRecipeData extends Partial<CreateRecipeData> {
  id: string;
}

// For the frontend recipe builder (matches your current interface)
export interface RecipeBuilderData {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: DifficultyLevel;
  mealType: MealType;
  ingredients: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugars?: number;
    sodium?: number;
    originalServingQty?: number;
    originalServingUnit?: string;
  }>;
  instructions: string[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  tags: string[];
  coverPhoto?: string;
  imageUrl?: string;
  videoUrl?: string;
  dietaryTag?: DietaryTag;
}

// Conversion functions between frontend and database formats
export function recipeBuilderToDatabase(
  recipeData: RecipeBuilderData
): CreateRecipeData {
  return {
    name: recipeData.name,
    short_description: recipeData.shortDescription,
    description: recipeData.description,
    servings: recipeData.servings,
    prep_time: recipeData.prepTime,
    cook_time: recipeData.cookTime,
    difficulty: recipeData.difficulty,
    meal_type: recipeData.mealType,
    dietary_tag: recipeData.dietaryTag,
    cover_photo: recipeData.coverPhoto,
    image_url: recipeData.imageUrl,
    video_url: recipeData.videoUrl,
    tags: recipeData.tags,
    instructions: recipeData.instructions,
    ingredients: recipeData.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      calories: ingredient.calories,
      protein: ingredient.protein,
      carbs: ingredient.carbs,
      fat: ingredient.fat,
      fiber: ingredient.fiber,
      sugars: ingredient.sugars,
      sodium: ingredient.sodium,
    })),
    total_calories: recipeData.totalCalories,
    total_protein: recipeData.totalProtein,
    total_carbs: recipeData.totalCarbs,
    total_fat: recipeData.totalFat,
    is_public: false, // Default to private
  };
}

export function databaseToRecipeBuilder(recipe: Recipe): RecipeBuilderData {
  return {
    id: recipe.id,
    name: recipe.name,
    shortDescription: recipe.short_description || "",
    description: recipe.description || "",
    servings: recipe.servings,
    prepTime: recipe.prep_time,
    cookTime: recipe.cook_time,
    difficulty: recipe.difficulty,
    mealType: recipe.meal_type,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    totalCalories: recipe.total_calories,
    totalProtein: recipe.total_protein,
    totalCarbs: recipe.total_carbs,
    totalFat: recipe.total_fat,
    tags: recipe.tags,
    coverPhoto: recipe.cover_photo,
    imageUrl: recipe.image_url,
    videoUrl: recipe.video_url,
    dietaryTag: recipe.dietary_tag,
  };
}
