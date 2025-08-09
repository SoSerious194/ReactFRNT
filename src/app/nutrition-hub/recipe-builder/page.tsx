"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  X,
  Clock,
  Upload,
  Sun,
  Moon,
  Apple,
  Utensils,
  Search,
  Sunrise,
} from "lucide-react";
import { RecipeService } from "@/lib/recipeServices";
import {
  recipeBuilderToDatabase,
  databaseToRecipeBuilder,
} from "@/types/recipe";

interface FoodItem {
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
  // Store original serving info for proper scaling
  originalServingQty?: number;
  originalServingUnit?: string;
}

interface NutritionixFood {
  food_name: string;
  serving_qty: number;
  serving_unit: string;
  serving_weight_grams: number;
  nf_calories: number;
  nf_total_fat: number;
  nf_saturated_fat: number;
  nf_cholesterol: number;
  nf_sodium: number;
  nf_total_carbohydrate: number;
  nf_dietary_fiber: number;
  nf_sugars: number;
  nf_protein: number;
  nf_potassium: number;
  alt_measures: Array<{
    serving_weight: number;
    measure: string;
    seq: number;
    qty: number;
  }>;
  photo: {
    thumb: string;
    highres: string;
  };
}

interface SearchResult {
  food_name: string;
  serving_qty: number;
  serving_unit: string;
  tag_id: string;
  photo: {
    thumb: string;
  };
}

interface Recipe {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  ingredients: FoodItem[];
  instructions: string[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  tags: string[];
  coverPhoto?: string;
  imageUrl?: string;
  videoUrl?: string;
  dietaryTag?:
    | "High Protein"
    | "Antioxidants"
    | "Low Carb"
    | "Heart Healthy"
    | "Anti-Inflammatory"
    | "Fiber Rich";
}

export default function RecipeBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editRecipeId = searchParams.get("edit");
  const isEditing = !!editRecipeId;

  const [ingredientSearch, setIngredientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [preparationNotes, setPreparationNotes] = useState("");
  const [currentStep, setCurrentStep] = useState("");
  const [recipeUrl, setRecipeUrl] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [autoAdjust, setAutoAdjust] = useState(true);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [originalServings, setOriginalServings] = useState(1);
  const [imageInputType, setImageInputType] = useState<"upload" | "url">(
    "upload"
  );
  const [isSaving, setIsSaving] = useState(false);

  const [currentRecipe, setCurrentRecipe] = useState<Recipe>({
    id: Date.now().toString(),
    name: "",
    shortDescription: "",
    description: "",
    servings: 1,
    prepTime: 0,
    cookTime: 0,
    difficulty: "Beginner",
    mealType: "breakfast",
    ingredients: [],
    instructions: [],
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    tags: [],
    imageUrl: "",
    videoUrl: "",
  });

  const [ingredientTitle, setIngredientTitle] = useState("For the filling");

  const handleSaveRecipe = async () => {
    // Validation
    if (!currentRecipe.name.trim()) {
      alert("Please enter a recipe name");
      return;
    }

    if (currentRecipe.ingredients.length === 0) {
      alert("Please add at least one ingredient");
      return;
    }

    if (currentRecipe.instructions.length === 0) {
      alert("Please add at least one instruction");
      return;
    }

    setIsSaving(true);
    try {
      // Convert frontend data to database format
      const recipeData = recipeBuilderToDatabase(currentRecipe);

      console.log("Recipe data being saved:", {
        name: currentRecipe.name,
        totalCalories: currentRecipe.totalCalories,
        totalProtein: currentRecipe.totalProtein,
        totalCarbs: currentRecipe.totalCarbs,
        totalFat: currentRecipe.totalFat,
        ingredients: currentRecipe.ingredients.length,
      });

      // Save to Supabase (create or update)
      let savedRecipe;
      if (isEditing && editRecipeId) {
        const updateData = { ...recipeData, id: editRecipeId };
        savedRecipe = await RecipeService.updateRecipe(
          editRecipeId,
          updateData
        );
        console.log("Recipe updated successfully:", savedRecipe);
        alert("Recipe updated successfully!");
      } else {
        savedRecipe = await RecipeService.createRecipe(recipeData);
        console.log("Recipe created successfully:", savedRecipe);
        alert("Recipe created successfully!");
      }

      // Navigate back to nutrition hub
      router.push("/nutrition-hub");
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Search for ingredients using Nutritionix API with debounce
  const searchIngredients = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/nutritionix/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.common) {
        setSearchResults(data.common.slice(0, 10)); // Limit to 10 results
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Error searching ingredients:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search function
  const debouncedSearch = React.useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => searchIngredients(query), 300);
      };
    })(),
    []
  );

  // Get nutrition data for an ingredient
  const getNutritionData = async (
    ingredientName: string
  ): Promise<NutritionixFood | null> => {
    try {
      const response = await fetch("/api/nutritionix/nutrients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: ingredientName }),
      });

      const data = await response.json();
      return data.foods?.[0] || null;
    } catch (error) {
      console.error("Error fetching nutrition data:", error);
      return null;
    }
  };

  // Add ingredient from search results
  const addIngredientFromSearch = async (searchResult: SearchResult) => {
    const nutritionData = await getNutritionData(searchResult.food_name);

    if (nutritionData) {
      const newIngredient: FoodItem = {
        id: Date.now().toString(),
        name: nutritionData.food_name,
        quantity: nutritionData.serving_qty,
        unit: nutritionData.serving_unit,
        calories: nutritionData.nf_calories,
        protein: nutritionData.nf_protein,
        carbs: nutritionData.nf_total_carbohydrate,
        fat: nutritionData.nf_total_fat,
        fiber: nutritionData.nf_dietary_fiber,
        sugars: nutritionData.nf_sugars,
        sodium: nutritionData.nf_sodium,
        originalServingQty: nutritionData.serving_qty,
        originalServingUnit: nutritionData.serving_unit,
      };

      setCurrentRecipe({
        ...currentRecipe,
        ingredients: [...currentRecipe.ingredients, newIngredient],
      });
    }

    setIngredientSearch("");
    setShowDropdown(false);
  };

  // Load existing recipe when editing
  useEffect(() => {
    const loadRecipeForEdit = async () => {
      if (isEditing && editRecipeId) {
        try {
          setIsSaving(true); // Use as loading state
          const recipe = await RecipeService.getRecipeById(editRecipeId);
          const builderData = databaseToRecipeBuilder(recipe);

          setCurrentRecipe(builderData);
          setOriginalServings(builderData.servings);
          setPreparationNotes(builderData.description || "");

          console.log("Loaded recipe for editing:", builderData);
        } catch (error) {
          console.error("Error loading recipe for edit:", error);
          alert("Failed to load recipe for editing");
          router.push("/nutrition-hub");
        } finally {
          setIsSaving(false);
        }
      }
    };

    loadRecipeForEdit();
  }, [isEditing, editRecipeId, router]);

  // Calculate total nutrition reactively when ingredients change
  // Set original servings when first ingredient is added
  useEffect(() => {
    if (
      currentRecipe.ingredients.length > 0 &&
      originalServings === 1 &&
      currentRecipe.servings !== 1
    ) {
      setOriginalServings(currentRecipe.servings);
    }
  }, [
    currentRecipe.ingredients.length,
    currentRecipe.servings,
    originalServings,
  ]);

  const totalNutrition = useMemo(() => {
    const result = currentRecipe.ingredients.reduce(
      (totals, ingredient) => {
        // Calculate multiplier based on current quantity vs original serving quantity
        const originalQty =
          ingredient.originalServingQty || ingredient.quantity || 1;
        const currentQty = ingredient.quantity || 1;
        const multiplier = currentQty / originalQty;

        console.log(
          `${ingredient.name}: ${currentQty} / ${originalQty} = ${multiplier}`
        );

        return {
          calories: totals.calories + ingredient.calories * multiplier,
          protein: totals.protein + ingredient.protein * multiplier,
          carbs: totals.carbs + ingredient.carbs * multiplier,
          fat: totals.fat + ingredient.fat * multiplier,
          fiber: totals.fiber + (ingredient.fiber || 0) * multiplier,
          sugars: totals.sugars + (ingredient.sugars || 0) * multiplier,
          sodium: totals.sodium + (ingredient.sodium || 0) * multiplier,
        };
      },
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sugars: 0,
        sodium: 0,
      }
    );

    console.log("Total nutrition calculated:", result);
    return result;
  }, [currentRecipe.ingredients]);

  // Update recipe totals whenever nutrition calculation changes
  useEffect(() => {
    setCurrentRecipe((prev) => ({
      ...prev,
      totalCalories: Math.round(totalNutrition.calories * 100) / 100,
      totalProtein: Math.round(totalNutrition.protein * 100) / 100,
      totalCarbs: Math.round(totalNutrition.carbs * 100) / 100,
      totalFat: Math.round(totalNutrition.fat * 100) / 100,
    }));
  }, [totalNutrition]);

  const handleUpdateIngredient = (
    index: number,
    field: keyof FoodItem,
    value: any
  ) => {
    const updatedIngredients = [...currentRecipe.ingredients];

    let processedValue = value;
    if (field === "quantity") {
      // Handle decimal numbers properly
      const numValue = parseFloat(value);
      processedValue = isNaN(numValue) ? 0 : numValue;
    }

    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [field]: processedValue,
    };
    setCurrentRecipe({
      ...currentRecipe,
      ingredients: updatedIngredients,
    });
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = currentRecipe.ingredients.filter(
      (_, i) => i !== index
    );
    setCurrentRecipe({
      ...currentRecipe,
      ingredients: updatedIngredients,
    });
  };

  const handleUpdateInstruction = (index: number, value: string) => {
    const updatedInstructions = [...currentRecipe.instructions];
    updatedInstructions[index] = value;
    setCurrentRecipe({
      ...currentRecipe,
      instructions: updatedInstructions,
    });
  };

  const handleRemoveInstruction = (index: number) => {
    const updatedInstructions = currentRecipe.instructions.filter(
      (_, i) => i !== index
    );
    setCurrentRecipe({
      ...currentRecipe,
      instructions: updatedInstructions,
    });
  };

  // Add a new preparation step
  const handleAddStep = () => {
    if (currentStep.trim()) {
      setCurrentRecipe({
        ...currentRecipe,
        instructions: [...currentRecipe.instructions, currentStep.trim()],
      });
      setCurrentStep("");
    }
  };

  // Handle Enter key press to add step
  const handleStepKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddStep();
    }
  };

  // Auto-adjust ingredients and instructions using AI
  const adjustRecipeForServings = async (newServings: number) => {
    if (
      !autoAdjust ||
      newServings === originalServings ||
      currentRecipe.ingredients.length === 0
    ) {
      return;
    }

    setIsAdjusting(true);
    try {
      const ratio = newServings / originalServings;

      // Adjust ingredients proportionally with smart rounding
      const adjustedIngredients = currentRecipe.ingredients.map(
        (ingredient) => {
          const newQuantity = ingredient.quantity * ratio;

          // Smart rounding based on quantity size
          let roundedQuantity;
          if (newQuantity >= 10) {
            // For large quantities, round to nearest 0.5
            roundedQuantity = Math.round(newQuantity * 2) / 2;
          } else if (newQuantity >= 1) {
            // For medium quantities, round to nearest 0.25
            roundedQuantity = Math.round(newQuantity * 4) / 4;
          } else if (newQuantity >= 0.1) {
            // For small quantities, round to nearest 0.125 (1/8)
            roundedQuantity = Math.round(newQuantity * 8) / 8;
          } else {
            // For very small quantities, round to nearest 0.0625 (1/16)
            roundedQuantity = Math.round(newQuantity * 16) / 16;
          }

          return {
            ...ingredient,
            quantity: roundedQuantity,
          };
        }
      );

      // Use AI to adjust cooking instructions if ratio is significant
      let adjustedInstructions = currentRecipe.instructions;
      if (Math.abs(ratio - 1) > 0.2 && currentRecipe.instructions.length > 0) {
        // Only if change is >20%
        const response = await fetch("/api/recipe/adjust-instructions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            instructions: currentRecipe.instructions,
            originalServings,
            newServings,
            ratio,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          adjustedInstructions =
            data.adjustedInstructions || currentRecipe.instructions;
        }
      }

      setCurrentRecipe((prev) => ({
        ...prev,
        servings: newServings,
        ingredients: adjustedIngredients,
        instructions: adjustedInstructions,
      }));
    } catch (error) {
      console.error("Error adjusting recipe:", error);
    } finally {
      setIsAdjusting(false);
    }
  };

  // Debounced serving adjustment
  const debouncedAdjustServings = React.useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (newServings: number) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => adjustRecipeForServings(newServings), 700);
      };
    })(),
    [
      autoAdjust,
      originalServings,
      currentRecipe.ingredients,
      currentRecipe.instructions,
    ]
  );

  // Handle servings change
  const handleServingsChange = (newServings: number) => {
    setCurrentRecipe((prev) => ({ ...prev, servings: newServings }));

    if (autoAdjust) {
      debouncedAdjustServings(newServings);
    }
  };

  // Import recipe from URL
  const handleImportRecipe = async () => {
    if (!recipeUrl.trim()) return;

    setIsImporting(true);
    try {
      const response = await fetch("/api/recipe/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: recipeUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to import recipe");
      }

      const importedRecipe = await response.json();

      // Auto-fill the form with imported data
      const importedServings = importedRecipe.servings || 1;
      setOriginalServings(importedServings);
      setCurrentRecipe({
        ...currentRecipe,
        name: importedRecipe.name || "",
        shortDescription: importedRecipe.shortDescription || "",
        description: importedRecipe.description || "",
        servings: importedServings,
        prepTime: importedRecipe.prepTime || 0,
        cookTime: importedRecipe.cookTime || 0,
        difficulty: importedRecipe.difficulty || "Beginner",
        mealType: importedRecipe.mealType || "breakfast",
        instructions: importedRecipe.instructions || [],
        dietaryTag: importedRecipe.dietaryTag || undefined,
      });

      // Import ingredients with nutrition data
      if (importedRecipe.ingredients && importedRecipe.ingredients.length > 0) {
        const ingredientsWithNutrition: FoodItem[] = [];
        for (const ingredient of importedRecipe.ingredients) {
          const nutritionData = await getNutritionData(ingredient.name);
          if (nutritionData) {
            ingredientsWithNutrition.push({
              id: Date.now().toString() + Math.random(),
              name: nutritionData.food_name,
              quantity: ingredient.quantity || nutritionData.serving_qty,
              unit: ingredient.unit || nutritionData.serving_unit,
              calories: nutritionData.nf_calories,
              protein: nutritionData.nf_protein,
              carbs: nutritionData.nf_total_carbohydrate,
              fat: nutritionData.nf_total_fat,
              fiber: nutritionData.nf_dietary_fiber,
              sugars: nutritionData.nf_sugars,
              sodium: nutritionData.nf_sodium,
              originalServingQty: nutritionData.serving_qty,
              originalServingUnit: nutritionData.serving_unit,
            });
          } else {
            // Add ingredient without nutrition data as fallback
            ingredientsWithNutrition.push({
              id: Date.now().toString() + Math.random(),
              name: ingredient.name,
              quantity: ingredient.quantity || 1,
              unit: ingredient.unit || "",
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
            });
          }
        }

        setCurrentRecipe((prev) => ({
          ...prev,
          ingredients: ingredientsWithNutrition,
        }));
      }

      setRecipeUrl("");
    } catch (error) {
      console.error("Error importing recipe:", error);
      alert("Failed to import recipe. Please try again or check the URL.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Full Page Loader Overlay */}
      {isAdjusting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-2xl border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-600"></div>
            <div className="text-lg font-semibold text-gray-900">
              Adjusting Recipe
            </div>
            <div className="text-sm text-gray-600 text-center max-w-xs">
              Scaling ingredients and optimizing cooking instructions for{" "}
              {currentRecipe.servings} serving
              {currentRecipe.servings !== 1 ? "s" : ""}...
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="py-8 px-16">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/nutrition-hub")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Nutrition Hub
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Recipe" : "Recipe Builder"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
          {/* Recipe Details Column - 1 unit */}
          <div className="lg:col-span-2 space-y-6 border-r border-gray-200 pr-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Name
              </label>
              <input
                type="text"
                value={currentRecipe.name}
                onChange={(e) =>
                  setCurrentRecipe({ ...currentRecipe, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <input
                type="text"
                placeholder="A brief one-sentence description of this recipe"
                value={currentRecipe.shortDescription}
                onChange={(e) =>
                  setCurrentRecipe({
                    ...currentRecipe,
                    shortDescription: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Photo
              </label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageInputType("upload")}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      imageInputType === "upload"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300"
                    }`}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputType("url")}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                      imageInputType === "url"
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-600 border border-gray-300"
                    }`}
                  >
                    URL
                  </button>
                </div>
                {imageInputType === "upload" ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Upload a cover photo
                    </p>
                  </div>
                ) : (
                  <input
                    type="url"
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    value={currentRecipe.imageUrl || ""}
                    onChange={(e) =>
                      setCurrentRecipe({
                        ...currentRecipe,
                        imageUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video URL
              </label>
              <input
                type="url"
                placeholder="Enter video URL (e.g., https://youtube.com/watch?v=...)"
                value={currentRecipe.videoUrl || ""}
                onChange={(e) =>
                  setCurrentRecipe({
                    ...currentRecipe,
                    videoUrl: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dietary Focus
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "High Protein", color: "blue" },
                  { label: "Antioxidants", color: "purple" },
                  { label: "Low Carb", color: "green" },
                  { label: "Heart Healthy", color: "red" },
                  { label: "Anti-Inflammatory", color: "orange" },
                  { label: "Fiber Rich", color: "yellow" },
                ].map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() =>
                      setCurrentRecipe({
                        ...currentRecipe,
                        dietaryTag:
                          currentRecipe.dietaryTag === tag.label
                            ? undefined
                            : (tag.label as any),
                      })
                    }
                    className={`px-3 py-2 text-xs font-medium rounded-full border transition-all ${
                      currentRecipe.dietaryTag === tag.label
                        ? tag.color === "blue"
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : tag.color === "purple"
                          ? "bg-purple-100 text-purple-800 border-purple-300"
                          : tag.color === "green"
                          ? "bg-green-100 text-green-800 border-green-300"
                          : tag.color === "red"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : tag.color === "orange"
                          ? "bg-orange-100 text-orange-800 border-orange-300"
                          : "bg-yellow-100 text-yellow-800 border-yellow-300"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Servings
              </label>
              <input
                type="number"
                min="1"
                value={currentRecipe.servings}
                onChange={(e) =>
                  handleServingsChange(parseInt(e.target.value) || 1)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={isAdjusting}
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <input
                type="checkbox"
                id="autoAdjust"
                checked={autoAdjust}
                onChange={(e) => setAutoAdjust(e.target.checked)}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                disabled={isAdjusting}
              />
              <label
                htmlFor="autoAdjust"
                className="flex-1 text-sm text-gray-700"
              >
                <div className="text-xs text-gray-500 mt-1">
                  Automatically scale ingredient quantities and cooking
                  instructions when changing servings
                </div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal
              </label>
              <div className="flex gap-2">
                <button
                  className={`p-3 rounded-full border-2 transition-colors ${
                    currentRecipe.mealType === "breakfast"
                      ? "border-orange-300 bg-orange-50"
                      : "border-gray-200"
                  }`}
                  onClick={() =>
                    setCurrentRecipe({
                      ...currentRecipe,
                      mealType: "breakfast",
                    })
                  }
                >
                  <Sunrise className="w-5 h-5 text-orange-300" />
                </button>
                <button
                  className={`p-3 rounded-full border-2 transition-colors ${
                    currentRecipe.mealType === "lunch"
                      ? "border-yellow-300 bg-yellow-50"
                      : "border-gray-200"
                  }`}
                  onClick={() =>
                    setCurrentRecipe({ ...currentRecipe, mealType: "lunch" })
                  }
                >
                  <Sun className="w-5 h-5 text-yellow-500" />
                </button>
                <button
                  className={`p-3 rounded-full border-2 transition-colors ${
                    currentRecipe.mealType === "dinner"
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-gray-200"
                  }`}
                  onClick={() =>
                    setCurrentRecipe({ ...currentRecipe, mealType: "dinner" })
                  }
                >
                  <Moon className="w-5 h-5 text-indigo-500" />
                </button>
                <button
                  className={`p-3 rounded-full border-2 transition-colors ${
                    currentRecipe.mealType === "snack"
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  onClick={() =>
                    setCurrentRecipe({ ...currentRecipe, mealType: "snack" })
                  }
                >
                  <Apple className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={currentRecipe.difficulty}
                onChange={(e) =>
                  setCurrentRecipe({
                    ...currentRecipe,
                    difficulty: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prep Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={currentRecipe.prepTime}
                  onChange={(e) =>
                    setCurrentRecipe({
                      ...currentRecipe,
                      prepTime: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="40 mins"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cook Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={currentRecipe.cookTime}
                  onChange={(e) =>
                    setCurrentRecipe({
                      ...currentRecipe,
                      cookTime: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="1 hr 20 mins"
                />
              </div>
            </div>
          </div>

          {/* Ingredients Column - 1 unit */}
          <div className="lg:col-span-3 space-y-6 border-r border-gray-200 px-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Recipe from URL
              </label>
              <div className="flex gap-2 mb-4">
                <input
                  type="url"
                  value={recipeUrl}
                  onChange={(e) => setRecipeUrl(e.target.value)}
                  placeholder="Paste recipe URL here (e.g., allrecipes.com, foodnetwork.com)"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  onClick={handleImportRecipe}
                  disabled={!recipeUrl.trim() || isImporting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isImporting ? "Importing..." : "Import"}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Ingredients
              </label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={ingredientSearch}
                  onChange={(e) => {
                    setIngredientSearch(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  onFocus={() => ingredientSearch && setShowDropdown(true)}
                  placeholder="Search and add or enter manually"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />

                {/* Search Results Dropdown */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {isSearching && (
                      <div className="p-3 text-sm text-gray-500">
                        Searching...
                      </div>
                    )}
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => addIngredientFromSearch(result)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          {result.photo?.thumb && (
                            <img
                              src={result.photo.thumb}
                              alt={result.food_name}
                              className="w-8 h-8 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-sm text-gray-900">
                              {result.food_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {result.serving_qty} {result.serving_unit}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {currentRecipe.ingredients.map((ingredient, index) => (
                <div
                  key={ingredient.id}
                  className="flex items-center gap-3 p-3 border-b border-gray-200"
                >
                  <div className="flex-1 font-medium text-sm text-gray-900">
                    {ingredient.name}
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        handleUpdateIngredient(
                          index,
                          "quantity",
                          e.target.value
                        )
                      }
                      className="w-16 px-2 py-1 text-sm border-b border-gray-300 focus:outline-none focus:border-green-500"
                      placeholder="Qty"
                    />
                    <input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) =>
                        handleUpdateIngredient(index, "unit", e.target.value)
                      }
                      className="w-12 px-2 py-1 text-sm border-b border-gray-300 focus:outline-none focus:border-green-500"
                      placeholder="Unit"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveIngredient(index)}
                    className="p-1 text-red-500 hover:text-red-700 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preparation Steps Column - 2 units */}
          <div className="lg:col-span-3 space-y-6 border-r border-gray-200 px-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preparation Steps
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={preparationNotes}
                  onChange={(e) => {
                    setPreparationNotes(e.target.value);
                    setCurrentRecipe({
                      ...currentRecipe,
                      description: e.target.value,
                    });
                  }}
                  className="w-full px-3 py-2 pr-10 border-b border-gray-300 focus:outline-none focus:border-green-500"
                  placeholder="Add overall notes..."
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              {/* Connecting line - only show if there are steps */}
              {currentRecipe.instructions.length > 0 && (
                <div className="absolute left-2.5 top-0 bottom-0 w-px border-l border-dashed border-gray-300"></div>
              )}

              <div className="space-y-4">
                {/* Existing steps */}
                {currentRecipe.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-3 items-start relative">
                    <div className="flex-shrink-0 w-5 h-5 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-medium mt-1 z-10">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={instruction}
                        onChange={(e) =>
                          handleUpdateInstruction(index, e.target.value)
                        }
                        placeholder={`Step ${index + 1}...`}
                        className="w-full p-2 text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-green-500 resize-none bg-transparent"
                        rows={Math.max(1, Math.ceil(instruction.length / 50))}
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveInstruction(index)}
                      className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 rounded mt-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Input for new step */}
                <div className="flex gap-3 items-start relative">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium mt-1 z-10">
                    {currentRecipe.instructions.length + 1}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={currentStep}
                      onChange={(e) => setCurrentStep(e.target.value)}
                      onKeyPress={handleStepKeyPress}
                      placeholder={`Step ${
                        currentRecipe.instructions.length + 1
                      }... (Press Enter to add)`}
                      className="w-full p-2 text-sm border-0 border-b border-gray-300 focus:outline-none focus:border-green-500 resize-none bg-transparent"
                      rows={Math.max(1, Math.ceil(currentStep.length / 50))}
                    />
                  </div>
                  {currentStep.trim() && (
                    <button
                      onClick={handleAddStep}
                      className="flex-shrink-0 p-1 text-green-500 hover:text-green-700 rounded mt-1"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Empty state message */}
                {currentRecipe.instructions.length === 0 && !currentStep && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-sm">
                      Start typing your first preparation step...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compact Nutrition Column - Single Line */}
          <div className="space-y-3 pl-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 text-center">
                Nutrition
              </h3>
              <div className="text-center">
                <div className="text-md font-bold text-green-600 leading-tight mt-8">
                  {Math.round(totalNutrition.calories)}
                </div>
                <div className="text-xs text-gray-600">Kcal</div>
              </div>
              <div className="space-y-2">
                <div className="text-center mt-8">
                  <div className="text-md font-bold text-green-600">
                    {Math.round(totalNutrition.fat)}g
                  </div>
                  <div className="text-xs text-gray-600">Fat</div>
                </div>
                <div className="text-center mt-8">
                  <div className="text-md font-bold text-green-600">
                    {Math.round(totalNutrition.carbs)}g
                  </div>
                  <div className="text-xs text-gray-600">Carbs</div>
                </div>
                <div className="text-center mt-8">
                  <div className="text-md font-bold text-green-600">
                    {Math.round(totalNutrition.sugars)}g
                  </div>
                  <div className="text-xs text-gray-600">Sugars</div>
                </div>
                <div className="text-center mt-8">
                  <div className="text-md font-bold text-green-600">
                    {Math.round(totalNutrition.fiber)}g
                  </div>
                  <div className="text-xs text-gray-600">Fibre</div>
                </div>
                <div className="text-center mt-8">
                  <div className="text-md font-bold text-green-600">
                    {Math.round(totalNutrition.protein)}g
                  </div>
                  <div className="text-xs text-gray-600">Protein</div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveRecipe}
                disabled={isSaving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md w-full justify-center transition-colors mt-8"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {isEditing ? "Update" : "Save"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
