"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Droplets, Calendar, Clock } from "lucide-react";
import { NutritionService } from "@/lib/nutritionServices";
import { useAuth } from "@/lib/useAuth";

interface NutritionDashboardProps {
  clientId?: string;
  onRefresh?: () => void;
}

interface DailySummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  water_ml: number;
  meal_count: number;
}

interface RecentLog {
  id: string;
  meal_type: string;
  total_calories?: number;
  logged_at: string;
  food_items: any[];
}

export default function NutritionDashboard({
  clientId,
  onRefresh,
}: NutritionDashboardProps) {
  const [dailySummary, setDailySummary] = useState<DailySummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water_ml: 0,
    meal_count: 0,
  });
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const nutritionService = new NutritionService();

  useEffect(() => {
    loadNutritionData();
  }, [clientId]);

  const loadNutritionData = async () => {
    setLoading(true);
    try {
      const userId = clientId || user?.id;
      if (!userId) return;

      const today = new Date().toISOString().split("T")[0];

      // Get today's nutrition logs
      const nutritionLogs = await nutritionService.getClientNutritionLogs(
        userId,
        today,
        today
      );

      // Get today's water logs
      const waterLogs = await nutritionService.getClientWaterLogs(
        userId,
        today,
        today
      );

      // Calculate daily summary
      const summary = nutritionService.calculateDailyTotals(nutritionLogs);
      const totalWater = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0);

      setDailySummary({
        ...summary,
        water_ml: totalWater,
        meal_count: nutritionLogs.length,
      });

      // Get recent logs (last 5)
      const allLogs = await nutritionService.getClientNutritionLogs(userId);
      setRecentLogs(allLogs.slice(0, 5));
    } catch (error) {
      console.error("Error loading nutrition data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case "breakfast":
        return "🌅";
      case "lunch":
        return "🌞";
      case "dinner":
        return "🌙";
      case "snack":
        return "🍎";
      case "pre_workout":
        return "💪";
      case "post_workout":
        return "🥤";
      default:
        return "🍽️";
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">
                {dailySummary.calories.toLocaleString()}
              </div>
              <div className="text-sm text-orange-700">Calories</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">
                {dailySummary.water_ml.toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">ml Water</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-900">
                {dailySummary.protein}g
              </div>
              <div className="text-sm text-green-700">Protein</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-900">
                {dailySummary.meal_count}
              </div>
              <div className="text-sm text-purple-700">Meals</div>
            </div>
          </div>

          {/* Macros Breakdown */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Macros</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Protein:</span>
                <span className="ml-1 font-medium">
                  {dailySummary.protein}g
                </span>
              </div>
              <div>
                <span className="text-gray-500">Carbs:</span>
                <span className="ml-1 font-medium">{dailySummary.carbs}g</span>
              </div>
              <div>
                <span className="text-gray-500">Fat:</span>
                <span className="ml-1 font-medium">{dailySummary.fat}g</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Meals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No meals logged yet</p>
              <p className="text-sm">
                Start logging your meals to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                >
                  <div className="text-2xl">
                    {getMealTypeIcon(log.meal_type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm capitalize">
                      {log.meal_type.replace("_", " ")}
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.food_items?.length || 0} items •{" "}
                      {log.total_calories || 0} cal
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(log.logged_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
          onClick={() => onRefresh?.()}
        >
          <Utensils className="w-5 h-5" />
          <span className="text-sm">Log Meal</span>
        </Button>
        <Button
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
          onClick={() => onRefresh?.()}
        >
          <Droplets className="w-5 h-5" />
          <span className="text-sm">Log Water</span>
        </Button>
      </div>
    </div>
  );
}
