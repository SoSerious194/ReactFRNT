"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Users,
  User,
  Check,
  Search,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserService, User as DatabaseUser } from "@/lib/userServices";
import { RecipeService } from "@/lib/recipeServices";
import { MealPlanService } from "@/lib/mealPlanServices";
import {
  WeekMealData,
  DayMealData,
  MealSlotData,
  CreateMealPlanRequest,
  UpdateMealPlanRequest,
  MealPlanComplete,
} from "@/types/mealPlan";
import UserAvatar from "@/components/ui/UserAvatar";

// Use the database Recipe type, but create a local interface for meal slot compatibility
interface MealRecipe {
  id: string;
  name: string;
  cover_photo?: string | null;
  image_url?: string | null;
  prep_time: number | null;
  cook_time: number | null;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  difficulty?: string;
  servings: number;
}

interface MealSlot {
  id: string;
  mealType: "breakfast" | "lunch" | "dinner";
  recipe?: MealRecipe;
}

interface DayMeals {
  date: string;
  dayNumber: number;
  meals: MealSlot[];
}

interface User {
  id: string;
  full_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  role: string | null;
  coach: string | null;
  created_at: string | null;
}

interface WeekNavigation {
  currentWeek: number; // 1, 2, 3, or 4
  daysInCurrentWeek: number[]; // Always [1, 2, 3, 4, 5, 6, 7] (Mon-Sun)
}

function MealPlanBuilderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMealPlanId = searchParams.get("edit");
  const duplicateMealPlanId = searchParams.get("duplicate");
  const isEditMode = Boolean(editMealPlanId);
  const isDuplicateMode = Boolean(duplicateMealPlanId);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [userSelectionMode, setUserSelectionMode] = useState<
    "all" | "individual"
  >("all");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [userLoadError, setUserLoadError] = useState<string | null>(null);
  const [availableRecipes, setAvailableRecipes] = useState<MealRecipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [recipeLoadError, setRecipeLoadError] = useState<string | null>(null);
  const [recipeSearchQuery, setRecipeSearchQuery] = useState("");
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [selectedRecipeForMeal, setSelectedRecipeForMeal] =
    useState<MealRecipe | null>(null);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [selectedMealSlot, setSelectedMealSlot] = useState<{
    dayNumber: number;
    mealType: string;
    isReplacing?: boolean;
  } | null>(null);
  const [mealPlanTitle, setMealPlanTitle] = useState(
    "Add Your Meal Plan Title"
  );
  const [mealPlanDescription, setMealPlanDescription] = useState(
    "Add Meal Plan Description"
  );
  const [weekNav, setWeekNav] = useState<WeekNavigation>({
    currentWeek: 1,
    daysInCurrentWeek: [1, 2, 3, 4, 5, 6, 7], // Monday to Sunday
  });
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [weekData, setWeekData] = useState<DayMeals[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isLoadingMealPlan, setIsLoadingMealPlan] = useState(false);
  const [mealPlanLoadError, setMealPlanLoadError] = useState<string | null>(
    null
  );

  // Load users from Supabase
  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setUserLoadError(null);

      const users = await UserService.getCoachClients();
      setAvailableUsers(users);
    } catch (error) {
      console.error("Failed to load users:", error);
      setUserLoadError("Failed to load users. Please try again.");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load existing meal plan data in edit mode
  const loadExistingMealPlan = async (mealPlanId: string) => {
    try {
      setIsLoadingMealPlan(true);
      setMealPlanLoadError(null);

      // Get meal plan data
      const mealPlanData = await MealPlanService.getMealPlanById(mealPlanId);

      if (mealPlanData.length === 0) {
        throw new Error("Meal plan not found");
      }

      // Get basic meal plan info from first record
      const firstRecord = mealPlanData[0];
      const title = firstRecord.title || "Add Your Meal Plan Title";
      setMealPlanTitle(isDuplicateMode ? `Copy of ${title}` : title);
      setMealPlanDescription(
        firstRecord.description || "Add Meal Plan Description"
      );

      // Get assigned users (only for edit mode, not for duplicate)
      if (!isDuplicateMode) {
        const assignedUsers = await MealPlanService.getMealPlanUsers(
          mealPlanId
        );

        const hasAllUsersAssignment = assignedUsers.some(
          (user) => user.user_id === null
        );

        if (hasAllUsersAssignment) {
          setUserSelectionMode("all");
          setSelectedUsers([]);
        } else {
          setUserSelectionMode("individual");
          setSelectedUsers(
            assignedUsers
              .filter((user) => user.user_id)
              .map((user) => user.user_id!)
          );
        }
      }

      // Get unique recipe IDs from the meal plan data
      const recipeIds = [
        ...new Set(
          mealPlanData
            .filter((record) => record.recipe_id)
            .map((record) => record.recipe_id!)
        ),
      ];

      // Fetch complete recipe details for all recipes used in the meal plan
      const recipeDetailsMap = new Map<string, MealRecipe>();
      if (recipeIds.length > 0) {
        try {
          const recipes = await RecipeService.getRecipesByIds(recipeIds);
          recipes.forEach((recipe) => {
            recipeDetailsMap.set(recipe.id, {
              id: recipe.id,
              name: recipe.name,
              cover_photo: recipe.cover_photo,
              image_url: recipe.image_url,
              prep_time: recipe.prep_time,
              cook_time: recipe.cook_time,
              total_calories: recipe.total_calories || 0,
              total_protein: recipe.total_protein || 0,
              total_carbs: recipe.total_carbs || 0,
              total_fat: recipe.total_fat || 0,
              difficulty: recipe.difficulty,
              servings: recipe.servings,
            });
          });
        } catch (error) {
          console.error("Error fetching recipe details:", error);
        }
      }

      // Transform meal plan data to weekData format
      const transformedWeekData: DayMeals[] = [];

      // Initialize all days for all weeks (1-4)
      for (let week = 1; week <= 4; week++) {
        for (let day = 1; day <= 7; day++) {
          const dayMeals: DayMeals = {
            date: `Week ${week} Day ${day}`,
            dayNumber: day,
            meals: [
              { id: `${week}-${day}-breakfast`, mealType: "breakfast" },
              { id: `${week}-${day}-lunch`, mealType: "lunch" },
              { id: `${week}-${day}-dinner`, mealType: "dinner" },
            ],
          };

          // Find and add assigned recipes for this day
          const dayData = mealPlanData.filter(
            (record) => record.week_number === week && record.day_number === day
          );

          dayData.forEach((record) => {
            if (record.recipe_id && record.meal_type) {
              const mealIndex = dayMeals.meals.findIndex(
                (meal) => meal.mealType === record.meal_type
              );

              if (mealIndex !== -1) {
                // Use complete recipe details if available, otherwise fallback to basic info
                const completeRecipe = recipeDetailsMap.get(record.recipe_id);

                dayMeals.meals[mealIndex].recipe = completeRecipe || {
                  id: record.recipe_id,
                  name: record.recipe_name || "Unknown Recipe",
                  total_calories: record.total_calories || 0,
                  total_protein: record.total_protein || 0,
                  total_carbs: record.total_carbs || 0,
                  total_fat: record.total_fat || 0,
                  servings: 1,
                  cover_photo: null,
                  image_url: null,
                  prep_time: null,
                  cook_time: null,
                  difficulty: undefined,
                };
              }
            }
          });

          transformedWeekData.push(dayMeals);
        }
      }

      setWeekData(transformedWeekData);
    } catch (error) {
      console.error("Failed to load meal plan:", error);
      setMealPlanLoadError(
        error instanceof Error ? error.message : "Failed to load meal plan"
      );
    } finally {
      setIsLoadingMealPlan(false);
    }
  };

  // Load recipes from Supabase
  const loadRecipes = async () => {
    try {
      setIsLoadingRecipes(true);
      setRecipeLoadError(null);

      const recipes = await RecipeService.getUserRecipes();

      // Convert DatabaseRecipe to MealRecipe format
      const mealRecipes: MealRecipe[] = recipes.map((recipe) => ({
        id: recipe.id,
        name: recipe.name,
        cover_photo: recipe.cover_photo,
        image_url: recipe.image_url,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        total_calories: recipe.total_calories || 0,
        total_protein: recipe.total_protein || 0,
        total_carbs: recipe.total_carbs || 0,
        total_fat: recipe.total_fat || 0,
        difficulty: recipe.difficulty,
        servings: recipe.servings,
      }));

      setAvailableRecipes(mealRecipes);
    } catch (error) {
      console.error("Failed to load recipes:", error);
      setRecipeLoadError("Failed to load recipes. Please try again.");
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  // Filter users based on search
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      false
  );

  // Filter recipes based on search
  const filteredRecipes = availableRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(recipeSearchQuery.toLowerCase())
  );

  // Helper functions for 4-week navigation
  const getDayName = (dayNumber: number) => {
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    return days[dayNumber - 1];
  };

  const getWeekTitle = (weekNumber: number) => {
    return `Week ${weekNumber}`;
  };

  // Check if a day has any meals assigned
  const hasMealsAssigned = (dayNumber: number) => {
    const dayData = weekData.find(
      (day) =>
        day.dayNumber === dayNumber &&
        day.date === `Week ${weekNav.currentWeek} Day ${dayNumber}`
    );
    return dayData?.meals.some((meal) => meal.recipe) || false;
  };

  // Load users and recipes on component mount
  useEffect(() => {
    loadUsers();
    loadRecipes();

    // Load existing meal plan data if in edit or duplicate mode
    if (isEditMode && editMealPlanId) {
      loadExistingMealPlan(editMealPlanId);
    } else if (isDuplicateMode && duplicateMealPlanId) {
      loadExistingMealPlan(duplicateMealPlanId);
    }
  }, [isEditMode, editMealPlanId, isDuplicateMode, duplicateMealPlanId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-dropdown-container")) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Initialize with Week 1, Day 1 (Monday)
    setSelectedDay(1);

    // Initialize all weeks with empty meal slots (only if not in edit mode)
    const initializeAllWeeks = () => {
      const allWeeksData: DayMeals[] = [];

      // Initialize all 4 weeks
      for (let week = 1; week <= 4; week++) {
        for (let day = 1; day <= 7; day++) {
          allWeeksData.push({
            date: `Week ${week} Day ${day}`, // Consistent with loading format
            dayNumber: day,
            meals: [
              {
                id: `w${week}-d${day}-breakfast`,
                mealType: "breakfast",
              },
              { id: `w${week}-d${day}-lunch`, mealType: "lunch" },
              {
                id: `w${week}-d${day}-dinner`,
                mealType: "dinner",
              },
            ],
          });
        }
      }
      setWeekData(allWeeksData);
    };

    // Only initialize if not in edit mode or duplicate mode
    if (!isEditMode && !isDuplicateMode) {
      initializeAllWeeks();
    }
  }, [weekNav.currentWeek, isEditMode, isDuplicateMode, weekData.length]);

  // Handle week change (1-4)
  const handleWeekChange = (weekNumber: number) => {
    if (weekNumber >= 1 && weekNumber <= 4) {
      setWeekNav((prev) => ({
        ...prev,
        currentWeek: weekNumber,
      }));
      setSelectedDay(1); // Reset to Monday when changing weeks
    }
  };

  // User selection functions
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(availableUsers.map((user) => user.id));
  };

  const clearUserSelection = () => {
    setSelectedUsers([]);
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((id) => id !== userId));
  };

  const getSelectedUserNames = () => {
    return selectedUsers
      .map((id) => availableUsers.find((user) => user.id === id)?.full_name)
      .filter(Boolean);
  };

  const getMealTypeLabel = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "BREAKFAST";
      case "lunch":
        return "LUNCH";
      case "dinner":
        return "DINNER";
      default:
        return mealType.toUpperCase();
    }
  };

  const addRecipeToMeal = (
    dayNumber: number,
    mealType: string,
    recipe: MealRecipe
  ) => {
    setWeekData((prev) =>
      prev.map((day) => {
        if (
          day.dayNumber === dayNumber &&
          day.date === `Week ${weekNav.currentWeek} Day ${dayNumber}`
        ) {
          return {
            ...day,
            meals: day.meals.map((meal) => {
              if (meal.mealType === mealType) {
                return { ...meal, recipe };
              }
              return meal;
            }),
          };
        }
        return day;
      })
    );
  };

  const handleAddRecipeToMeal = (recipe: MealRecipe) => {
    setSelectedRecipeForMeal(recipe);
    setShowMealSelector(true);
  };

  const handleMealTypeSelect = (mealType: "breakfast" | "lunch" | "dinner") => {
    if (selectedRecipeForMeal) {
      addRecipeToMeal(selectedDay, mealType, selectedRecipeForMeal);
      setShowMealSelector(false);
      setSelectedRecipeForMeal(null);
    }
  };

  const handleAddRecipeToSlot = (
    dayNumber: number,
    mealType: string,
    isReplacing = false
  ) => {
    setSelectedMealSlot({ dayNumber, mealType, isReplacing });
    setShowRecipeSelector(true);
  };

  const handleRecipeSelect = (recipe: MealRecipe) => {
    if (selectedMealSlot) {
      addRecipeToMeal(
        selectedMealSlot.dayNumber,
        selectedMealSlot.mealType,
        recipe
      );
      setShowRecipeSelector(false);
      setSelectedMealSlot(null);
    }
  };

  const selectedDayData = weekData.find(
    (day) =>
      day.dayNumber === selectedDay &&
      day.date === `Week ${weekNav.currentWeek} Day ${selectedDay}`
  );

  // Convert UI data to service format
  const convertToWeekMealData = (): WeekMealData[] => {
    const weekMealData: WeekMealData[] = [];

    // Group data by weeks (1-4)
    for (let week = 1; week <= 4; week++) {
      const dayMealData: DayMealData[] = [];

      // For each day in the week (1-7)
      for (let day = 1; day <= 7; day++) {
        const dayData = weekData.find(
          (d) => d.dayNumber === day && d.date === `Week ${week} Day ${day}`
        );

        const mealSlotData: MealSlotData[] =
          dayData?.meals.map((meal) => ({
            mealType: meal.mealType,
            recipeId: meal.recipe?.id || null,
          })) || [];

        dayMealData.push({
          dayNumber: day,
          meals: mealSlotData,
        });
      }

      weekMealData.push({
        week,
        days: dayMealData,
      });
    }

    return weekMealData;
  };

  // Validate meal plan data
  const validateMealPlan = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!mealPlanTitle.trim()) {
      errors.push("Meal plan title is required");
    }

    if (userSelectionMode === "individual" && selectedUsers.length === 0) {
      errors.push("Please select at least one user for individual assignment");
    }

    // Check if at least one meal is assigned
    const hasAnyMeals = weekData.some((day) =>
      day.meals.some((meal) => meal.recipe)
    );

    if (!hasAnyMeals) {
      errors.push("Please assign at least one recipe to a meal slot");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  // Save meal plan
  const handleSaveMealPlan = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);

      // Validate the meal plan
      const validation = validateMealPlan();
      if (!validation.valid) {
        setSaveError(validation.errors.join(", "));
        return;
      }

      // Get current user
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setSaveError("User not authenticated");
        return;
      }

      // Check if selected users already have meal plans (for individual mode)
      if (userSelectionMode === "individual" && selectedUsers.length > 0) {
        const userValidation = await MealPlanService.validateUserAssignments(
          selectedUsers
        );
        if (!userValidation.valid) {
          const usersWithPlans = userValidation.usersWithPlans
            .map(
              (userId) => availableUsers.find((u) => u.id === userId)?.full_name
            )
            .filter(Boolean);
          setSaveError(
            `The following users already have active meal plans: ${usersWithPlans.join(
              ", "
            )}`
          );
          return;
        }
      }

      if (isEditMode && editMealPlanId) {
        // Update existing meal plan
        const updateRequest: UpdateMealPlanRequest = {
          id: editMealPlanId,
          mealPlan: {
            title: mealPlanTitle.trim(),
            description: mealPlanDescription.trim() || null,
          },
          userSelectionMode,
          selectedUsers,
          mealData: convertToWeekMealData(),
        };

        await MealPlanService.updateMealPlan(updateRequest);

        // Success! Navigate back to nutrition hub
        router.push("/nutrition-hub?success=meal-plan-updated");
      } else {
        // Create new meal plan (both new creation and duplication)
        const weekMealData = convertToWeekMealData();

        const createRequest: CreateMealPlanRequest = {
          mealPlan: {
            coach_id: user.id,
            title: mealPlanTitle.trim(),
            description: mealPlanDescription.trim() || null,
          },
          userSelectionMode,
          selectedUsers,
          mealData: weekMealData,
        };

        await MealPlanService.createMealPlan(createRequest);

        // Success! Navigate back to nutrition hub
        const successMessage = isDuplicateMode
          ? "meal-plan-duplicated"
          : "meal-plan-created";
        router.push(`/nutrition-hub?success=${successMessage}`);
      }
    } catch (error) {
      console.error("Error saving meal plan:", error);
      setSaveError(
        error instanceof Error ? error.message : "Failed to save meal plan"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* Loading Overlay */}
      {(isSaving || isLoadingMealPlan) && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-900 font-medium">
                {isLoadingMealPlan
                  ? "Loading meal plan..."
                  : isEditMode
                  ? "Updating meal plan..."
                  : isDuplicateMode
                  ? "Duplicating meal plan..."
                  : "Saving meal plan..."}
              </span>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push("/nutrition-hub")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Nutrition Hub
          </button>

          <Button
            onClick={handleSaveMealPlan}
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {isSaving
              ? isEditMode
                ? "Updating..."
                : isDuplicateMode
                ? "Duplicating..."
                : "Saving..."
              : isEditMode
              ? "Update Meal Plan"
              : isDuplicateMode
              ? "Duplicate Meal Plan"
              : "Save Meal Plan"}
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <input
              type="text"
              value={mealPlanTitle}
              onChange={(e) => setMealPlanTitle(e.target.value)}
              className="text-3xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 rounded px-2 py-1 w-full placeholder-gray-400"
              placeholder="Enter meal plan title..."
            />
          </div>
          <div>
            <textarea
              value={mealPlanDescription}
              onChange={(e) => setMealPlanDescription(e.target.value)}
              className="text-gray-600 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 rounded px-2 py-1 w-full resize-none placeholder-gray-400"
              placeholder="Enter meal plan description..."
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* User Selection */}
      <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Assign Meals To
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant={userSelectionMode === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setUserSelectionMode("all");
                selectAllUsers();
              }}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              All Users
            </Button>
            <Button
              variant={
                userSelectionMode === "individual" ? "default" : "outline"
              }
              size="sm"
              onClick={() => {
                setUserSelectionMode("individual");
                clearUserSelection();
                setShowUserDropdown(false);
              }}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Individual Users
            </Button>
          </div>
        </div>

        {userSelectionMode === "individual" && (
          <div className="space-y-4">
            {/* Selected Users Display */}
            {selectedUsers.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Selected Users ({selectedUsers.length})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearUserSelection}
                  >
                    Clear All
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((userId) => {
                    const user = availableUsers.find((u) => u.id === userId);
                    return user ? (
                      <div
                        key={userId}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm"
                      >
                        <UserAvatar user={user} size="sm" />
                        <span className="text-gray-700">
                          {user.full_name || "Unknown User"}
                        </span>
                        <button
                          onClick={() => removeUser(userId)}
                          className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {/* User Search & Selection */}
            <div className="relative user-dropdown-container">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search and select users..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  onFocus={() => setShowUserDropdown(true)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showUserDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* User Dropdown */}
              {showUserDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {/* Quick Actions */}
                  <div className="p-2 border-b border-gray-100 bg-gray-50">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          selectAllUsers();
                          setShowUserDropdown(false);
                        }}
                        className="flex-1 text-xs"
                      >
                        Select All ({availableUsers.length})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const filtered = filteredUsers.map((u) => u.id);
                          setSelectedUsers((prev) => [
                            ...new Set([...prev, ...filtered]),
                          ]);
                          setShowUserDropdown(false);
                        }}
                        className="flex-1 text-xs"
                      >
                        Select Filtered ({filteredUsers.length})
                      </Button>
                    </div>
                  </div>

                  {/* User List */}
                  <div className="max-h-40 overflow-y-auto">
                    {isLoadingUsers ? (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        Loading users...
                      </div>
                    ) : userLoadError ? (
                      <div className="p-3 text-center">
                        <div className="text-red-500 text-sm mb-2">
                          {userLoadError}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={loadUsers}
                          className="text-xs"
                        >
                          Retry
                        </Button>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-3 text-center text-gray-500 text-sm">
                        {userSearchQuery
                          ? `No users found matching "${userSearchQuery}"`
                          : "No users assigned to you"}
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            toggleUserSelection(user.id);
                            setUserSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0"
                        >
                          <div className="relative">
                            <UserAvatar user={user} size="md" />
                            {selectedUsers.includes(user.id) && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-gray-700 flex-1">
                            {user.full_name || "Unknown User"}
                          </span>
                          {selectedUsers.includes(user.id) && (
                            <Check className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedUsers.length === 0 && !isLoadingUsers && (
              <div className="text-sm text-gray-500 text-center py-2">
                {userLoadError
                  ? "Unable to load users. Please try refreshing the page."
                  : "Search and select users to assign this meal plan to specific individuals."}
              </div>
            )}
          </div>
        )}

        {userSelectionMode === "all" && (
          <div className="text-sm text-gray-600">
            This meal plan will be applied to all users in your organization.
          </div>
        )}
      </div>

      {/* Week Navigation */}
      <div className="mb-6 bg-white rounded-lg p-3 shadow-sm">
        {/* Week Selection */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3, 4].map((weekNumber) => (
            <button
              key={weekNumber}
              onClick={() => handleWeekChange(weekNumber)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                weekNav.currentWeek === weekNumber
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Week {weekNumber}
            </button>
          ))}
        </div>

        {/* Day Selection */}
        <div className="flex items-center justify-center gap-1">
          {weekNav.daysInCurrentWeek.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`w-12 h-12 rounded-md flex flex-col items-center justify-center text-xs transition-colors ${
                selectedDay === day
                  ? "bg-green-100 text-green-700 border border-green-300"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              <span className="text-xs text-gray-400 mb-0.5">
                {getDayName(day).slice(0, 3)}
              </span>
              <span
                className={`text-sm font-semibold ${
                  hasMealsAssigned(day) ? "text-green-600" : "text-gray-500"
                }`}
              >
                {day}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Day Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">✓</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">
            {getDayName(selectedDay)} - Week {weekNav.currentWeek}
          </span>
        </div>
      </div>

      {/* Error Display */}
      {(saveError || mealPlanLoadError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <X className="w-5 h-5 text-red-500" />
            <span className="text-red-700 font-medium">
              {mealPlanLoadError
                ? "Error loading meal plan"
                : "Error saving meal plan"}
            </span>
          </div>
          <p className="text-red-600 text-sm mt-1">
            {saveError || mealPlanLoadError}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSaveError(null);
              setMealPlanLoadError(null);
            }}
            className="mt-2 text-red-600 hover:text-red-700"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Meals Grid */}
      {selectedDayData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {selectedDayData.meals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm"
            >
              {/* Meal Header */}
              <div className="p-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {getMealTypeLabel(meal.mealType)}
                </h3>
              </div>

              {/* Meal Content */}
              <div className="p-4">
                {meal.recipe ? (
                  <div className="space-y-4">
                    {/* Recipe Image */}
                    <div className="relative">
                      <img
                        src={
                          meal.recipe.cover_photo ||
                          meal.recipe.image_url ||
                          "/api/placeholder/300/200"
                        }
                        alt={meal.recipe.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                        {(meal.recipe.prep_time || 0) +
                          (meal.recipe.cook_time || 0)}{" "}
                        Min Total
                      </div>
                    </div>

                    {/* Recipe Info */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">
                        {meal.recipe.name}
                      </h4>

                      {/* Nutrition Grid */}
                      <div className="grid grid-cols-4 gap-4 text-center text-sm mb-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            CALORIES
                          </div>
                          <div className="text-gray-600">
                            {Math.round(meal.recipe.total_calories)}
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">FAT</div>
                          <div className="text-gray-600">
                            {Math.round(meal.recipe.total_fat)}g
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            PROTEIN
                          </div>
                          <div className="text-gray-600">
                            {Math.round(meal.recipe.total_protein)}g
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            NET CARBS
                          </div>
                          <div className="text-gray-600">
                            {Math.round(meal.recipe.total_carbs)}g
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Remove recipe from meal
                            setWeekData((prev) =>
                              prev.map((day) => {
                                if (
                                  day.dayNumber === selectedDay &&
                                  day.date ===
                                    `Week ${weekNav.currentWeek} Day ${selectedDay}`
                                ) {
                                  return {
                                    ...day,
                                    meals: day.meals.map((m) => {
                                      if (m.mealType === meal.mealType) {
                                        return { ...m, recipe: undefined };
                                      }
                                      return m;
                                    }),
                                  };
                                }
                                return day;
                              })
                            );
                          }}
                          className="flex-1"
                        >
                          Remove
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            handleAddRecipeToSlot(
                              selectedDay,
                              meal.mealType,
                              true
                            );
                          }}
                          className="flex-1"
                          disabled={availableRecipes.length === 0}
                        >
                          Replace
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm mb-3">
                      No recipe assigned
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleAddRecipeToSlot(selectedDay, meal.mealType);
                      }}
                      disabled={availableRecipes.length === 0}
                    >
                      Add Recipe
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Available Recipes */}
      <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Available Recipes
          </h3>
          {recipeLoadError && (
            <Button
              variant="ghost"
              size="sm"
              onClick={loadRecipes}
              className="text-xs"
            >
              Retry
            </Button>
          )}
        </div>

        {/* Recipe Search */}
        {!isLoadingRecipes &&
          !recipeLoadError &&
          availableRecipes.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={recipeSearchQuery}
                  onChange={(e) => setRecipeSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

        {isLoadingRecipes ? (
          <div className="text-center py-8 text-gray-500">
            Loading recipes...
          </div>
        ) : recipeLoadError ? (
          <div className="text-center py-8">
            <div className="text-red-500 text-sm mb-2">{recipeLoadError}</div>
            <p className="text-gray-500 text-sm">
              Please try again or create some recipes first.
            </p>
          </div>
        ) : availableRecipes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No recipes available</p>
            <p className="text-sm">
              Create some recipes in the Recipe Builder to get started.
            </p>
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">
              No recipes found matching "{recipeSearchQuery}"
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Recipe Thumbnail */}
                <div className="h-32 bg-gray-100 overflow-hidden">
                  <img
                    src={
                      recipe.cover_photo ||
                      recipe.image_url ||
                      "/api/placeholder/300/200"
                    }
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Recipe Info */}
                <div className="p-4">
                  <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {recipe.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min •{" "}
                    {Math.round(recipe.total_calories)} cal
                  </p>

                  {/* Nutrition Summary */}
                  <div className="flex justify-between text-xs text-gray-500 mb-3">
                    <span>P: {Math.round(recipe.total_protein)}g</span>
                    <span>C: {Math.round(recipe.total_carbs)}g</span>
                    <span>F: {Math.round(recipe.total_fat)}g</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddRecipeToMeal(recipe)}
                    className="w-full"
                  >
                    Add to Meal
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Selector Modal */}
      {showRecipeSelector && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedMealSlot?.isReplacing ? "Replace" : "Select"}{" "}
                    Recipe for {selectedMealSlot?.mealType?.toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Day {selectedMealSlot?.dayNumber}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowRecipeSelector(false);
                    setSelectedMealSlot(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Search within modal */}
              <div className="mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={recipeSearchQuery}
                    onChange={(e) => setRecipeSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {recipeSearchQuery
                    ? `No recipes found matching "${recipeSearchQuery}"`
                    : "No recipes available"}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleRecipeSelect(recipe)}
                    >
                      {/* Recipe Thumbnail */}
                      <div className="h-32 bg-gray-100 overflow-hidden">
                        <img
                          src={
                            recipe.cover_photo ||
                            recipe.image_url ||
                            "/api/placeholder/300/200"
                          }
                          alt={recipe.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Recipe Info */}
                      <div className="p-4">
                        <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                          {recipe.name}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          {(recipe.prep_time || 0) + (recipe.cook_time || 0)}{" "}
                          min • {Math.round(recipe.total_calories)} cal
                        </p>

                        {/* Nutrition Summary */}
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>P: {Math.round(recipe.total_protein)}g</span>
                          <span>C: {Math.round(recipe.total_carbs)}g</span>
                          <span>F: {Math.round(recipe.total_fat)}g</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Meal Selector Modal */}
      {showMealSelector && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Meal Type
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Where would you like to add "{selectedRecipeForMeal?.name}"?
            </p>

            <div className="space-y-3">
              {[
                {
                  type: "breakfast" as const,
                  label: "Breakfast",
                  icon: "🌅",
                },
                { type: "lunch" as const, label: "Lunch", icon: "☀️" },
                { type: "dinner" as const, label: "Dinner", icon: "🌙" },
              ].map((meal) => (
                <Button
                  key={meal.type}
                  variant="outline"
                  className="w-full justify-start text-left p-4 h-auto"
                  onClick={() => handleMealTypeSelect(meal.type)}
                >
                  <span className="text-lg mr-3">{meal.icon}</span>
                  <div>
                    <div className="font-medium">{meal.label}</div>
                    <div className="text-sm text-gray-500">
                      Day {selectedDay}
                    </div>
                  </div>
                </Button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowMealSelector(false);
                  setSelectedRecipeForMeal(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MealPlanBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
          </div>
        </div>
      }
    >
      <MealPlanBuilderPageContent />
    </Suspense>
  );
}
