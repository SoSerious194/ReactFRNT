"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Plus,
  X,
  Utensils,
  Droplets,
  Save,
  Loader2,
} from "lucide-react";
import { NutritionService, LoggedFoodItem } from "@/lib/nutritionServices";
import { useAuth } from "@/lib/useAuth";

interface FoodLoggerProps {
  clientId?: string;
  onLogComplete?: () => void;
}

export default function FoodLogger({ clientId, onLogComplete }: FoodLoggerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFoods, setSelectedFoods] = useState<LoggedFoodItem[]>([]);
  const [mealType, setMealType] = useState("breakfast");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const { user } = useAuth();
  const nutritionService = new NutritionService();

  const mealTypes = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" },
    { value: "pre_workout", label: "Pre-Workout" },
    { value: "post_workout", label: "Post-Workout" },
  ];

  // Search for foods
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const results = await nutritionService.searchFoods(searchQuery);
      const allResults = [...(results.common || []), ...(results.branded || [])];
      setSearchResults(allResults.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      console.error("Error searching foods:", error);
    } finally {
      setSearching(false);
    }
  };

  // Add food to selected list
  const addFood = (food: any) => {
    const newFood: LoggedFoodItem = {
      food_name: food.food_name,
      quantity: 1,
      unit: food.serving_unit || "serving",
      calories: 0, // Will be calculated when we get full nutrition data
      protein: 0,
      carbs: 0,
      fat: 0,
      nutritionix_id: food.nix_item_id,
    };

    setSelectedFoods([...selectedFoods, newFood]);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Update food quantity
  const updateFoodQuantity = (index: number, quantity: number) => {
    const updatedFoods = [...selectedFoods];
    updatedFoods[index].quantity = quantity;
    setSelectedFoods(updatedFoods);
  };

  // Remove food from list
  const removeFood = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  // Log the meal
  const handleLogMeal = async () => {
    if (!user || selectedFoods.length === 0) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const logData = {
        client_id: clientId || user.id,
        coach_id: user.id, // Assuming the logged-in user is the coach
        log_date: today,
        meal_type: mealType,
        food_items: selectedFoods,
        notes: notes.trim() || undefined,
      };

      const result = await nutritionService.createNutritionLog(logData);
      
      if (result) {
        // Reset form
        setSelectedFoods([]);
        setNotes("");
        setMealType("breakfast");
        onLogComplete?.();
      }
    } catch (error) {
      console.error("Error logging meal:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totals = selectedFoods.reduce(
    (sum, food) => ({
      calories: sum.calories + food.calories,
      protein: sum.protein + food.protein,
      carbs: sum.carbs + food.carbs,
      fat: sum.fat + food.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Meal Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="w-5 h-5" />
            Log Meal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meal Type
              </label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mealTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Food Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Foods
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search for foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  size="sm"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Search Results</h4>
                <div className="space-y-2">
                  {searchResults.map((food, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => addFood(food)}
                    >
                      <div>
                        <div className="font-medium text-sm">{food.food_name}</div>
                        <div className="text-xs text-gray-500">
                          {food.brand_name && `${food.brand_name} • `}
                          {food.serving_unit}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Foods */}
            {selectedFoods.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Foods</h4>
                <div className="space-y-2">
                  {selectedFoods.map((food, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{food.food_name}</div>
                        <div className="text-xs text-gray-500">
                          {food.calories} cal • {food.protein}g protein • {food.carbs}g carbs • {food.fat}g fat
                        </div>
                      </div>
                      <Input
                        type="number"
                        value={food.quantity}
                        onChange={(e) => updateFoodQuantity(index, parseFloat(e.target.value) || 1)}
                        className="w-16 text-center"
                        min="0.1"
                        step="0.1"
                      />
                      <span className="text-xs text-gray-500">{food.unit}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFood(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            {selectedFoods.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Meal Totals</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Calories:</span>
                    <span className="ml-2 font-medium">{totals.calories}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Protein:</span>
                    <span className="ml-2 font-medium">{totals.protein}g</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Carbs:</span>
                    <span className="ml-2 font-medium">{totals.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fat:</span>
                    <span className="ml-2 font-medium">{totals.fat}g</span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <Textarea
                placeholder="Add any notes about this meal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>

            {/* Log Button */}
            <Button
              onClick={handleLogMeal}
              disabled={loading || selectedFoods.length === 0}
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Logging Meal...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Log Meal
                </div>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 