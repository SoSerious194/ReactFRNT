"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  BarChart3,
  Search,
  Droplets,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  ChefHat,
  Calendar,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { RecipeService } from "@/lib/recipeServices";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";

interface NutritionLog {
  id: string;
  client_id: string;
  coach_id: string;
  log_date: string;
  meal_type: string;
  food_items: any[];
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fat?: number;
  notes?: string;
  logged_at: string;
  created_at: string;
  updated_at: string;
}

interface WaterLog {
  id: string;
  client_id: string;
  coach_id: string;
  log_date: string;
  amount_ml: number;
  logged_at: string;
  created_at: string;
}

interface ClientSummary {
  client_id: string;
  client_name: string;
  last_logged: string;
  today_calories: number;
  today_meals: number;
  today_water_ml: number;
}

interface RecentActivity {
  client_name: string;
  activity: string;
  timestamp: string;
  type: "log" | "water";
  // Add detailed information for expansion
  details?: {
    meal_type?: string;
    food_items?: any[];
    total_calories?: number;
    total_protein?: number;
    total_carbs?: number;
    total_fat?: number;
    notes?: string;
    amount_ml?: number;
  };
}

export default function NutritionHubPage() {
  const [activeTab, setActiveTab] = useState("clients");
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadNutritionData();
    }
  }, [user]);

  const loadNutritionData = async () => {
    setLoading(true);
    try {
      const coachId = user?.id;
      if (!coachId) return;

      // Get all clients for this coach
      const { data: clientUsers, error: clientError } = await supabase
        .from("users")
        .select("id, full_name")
        .eq("coach", coachId);

      if (clientError) {
        console.error("Error fetching clients:", clientError);
        return;
      }

      // Get today's date
      const today = new Date().toISOString().split("T")[0];

      // Get nutrition logs for today
      const { data: todayLogs, error: logsError } = await supabase
        .from("nutrition_logs")
        .select("*")
        .eq("coach_id", coachId)
        .eq("log_date", today);

      if (logsError) {
        console.error("Error fetching nutrition logs:", logsError);
      }

      // Get water logs for today
      const { data: todayWaterLogs, error: waterError } = await supabase
        .from("water_logs")
        .select("*")
        .eq("coach_id", coachId)
        .eq("log_date", today);

      if (waterError) {
        console.error("Error fetching water logs:", waterError);
      }

      // Calculate client summaries
      const clientSummaries: ClientSummary[] =
        clientUsers?.map((client) => {
          const clientLogs =
            todayLogs?.filter((log) => log.client_id === client.id) || [];
          const clientWaterLogs =
            todayWaterLogs?.filter((log) => log.client_id === client.id) || [];

          const totalCalories = clientLogs.reduce(
            (sum, log) => sum + (log.total_calories || 0),
            0
          );
          const totalWater = clientWaterLogs.reduce(
            (sum, log) => sum + log.amount_ml,
            0
          );

          const lastLogged =
            clientLogs.length > 0
              ? new Date(clientLogs[0].logged_at).toLocaleTimeString()
              : "Not logged today";

          return {
            client_id: client.id,
            client_name: client.full_name || "Unknown",
            last_logged: lastLogged,
            today_calories: totalCalories,
            today_meals: clientLogs.length,
            today_water_ml: totalWater,
          };
        }) || [];

      setClients(clientSummaries);
      setNutritionLogs(todayLogs || []);
      setWaterLogs(todayWaterLogs || []);

      // Create recent activity with client names
      const createRecentActivity = (): RecentActivity[] => {
        const activities: RecentActivity[] = [];

        // Add nutrition logs
        if (todayLogs) {
          todayLogs.forEach((log) => {
            const client = clientUsers?.find((c) => c.id === log.client_id);
            activities.push({
              client_name: client?.full_name || "Unknown Client",
              activity: `Logged ${log.meal_type}`,
              timestamp: log.logged_at, // Keep original timestamp for sorting
              type: "log",
              details: {
                meal_type: log.meal_type,
                food_items: log.food_items,
                total_calories: log.total_calories,
                total_protein: log.total_protein,
                total_carbs: log.total_carbs,
                total_fat: log.total_fat,
                notes: log.notes,
              },
            });
          });
        }

        // Add water logs
        if (todayWaterLogs) {
          todayWaterLogs.forEach((log) => {
            const client = clientUsers?.find((c) => c.id === log.client_id);
            activities.push({
              client_name: client?.full_name || "Unknown Client",
              activity: `Logged ${log.amount_ml}ml water`,
              timestamp: log.logged_at, // Keep original timestamp for sorting
              type: "water",
              details: {
                amount_ml: log.amount_ml,
              },
            });
          });
        }

        // Sort by timestamp (most recent first) and take last 5
        return activities
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 5)
          .map((activity) => ({
            ...activity,
            timestamp: new Date(activity.timestamp).toLocaleTimeString(),
          }));
      };

      setRecentActivity(createRecentActivity());
    } catch (error) {
      console.error("Error loading nutrition data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAnalytics = () => {
    const totalClients = clients.length;
    const activeClients = clients.filter(
      (client) => client.today_meals > 0
    ).length;
    const loggingRate =
      totalClients > 0 ? Math.round((activeClients / totalClients) * 100) : 0;
    const totalCalories = clients.reduce(
      (sum, client) => sum + client.today_calories,
      0
    );
    const totalWater = clients.reduce(
      (sum, client) => sum + client.today_water_ml,
      0
    );

    return {
      totalClients,
      activeClients,
      loggingRate,
      totalCalories,
      totalWater,
    };
  };

  const analytics = getAnalytics();

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading nutrition data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Nutrition Hub</h1>
        <p className="text-lg text-gray-600">
          Track and manage your clients' nutrition progress
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="clients"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <Users className="w-4 h-4" />
            Client Nutrition
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="recipe-builder"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <ChefHat className="w-4 h-4" />
            Recipe Builder
          </TabsTrigger>
          <TabsTrigger
            value="meal-plan-builder"
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <Calendar className="w-4 h-4" />
            Meal Plan Builder
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="mt-8">
          <ClientNutritionTab
            clients={filteredClients}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </TabsContent>

        <TabsContent value="analytics" className="mt-8">
          <AnalyticsTab analytics={analytics} recentActivity={recentActivity} />
        </TabsContent>

        <TabsContent value="recipe-builder" className="mt-8">
          <RecipeBuilderTab />
        </TabsContent>

        <TabsContent value="meal-plan-builder" className="mt-8">
          <MealPlanBuilderTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ClientNutritionTabProps {
  clients: ClientSummary[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

function ClientNutritionTab({
  clients,
  searchQuery,
  onSearchChange,
}: ClientNutritionTabProps) {
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const router = useRouter();

  const handleViewDetails = (client: ClientSummary) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const handleSendMessage = (client: ClientSummary) => {
    router.push(`/inbox/${client.client_id}`);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Client Nutrition Tracking
        </h3>
        <div className="text-sm text-gray-500">
          {clients.length} client{clients.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-4">
        {clients.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? "No clients match your search" : "No clients found"}
          </div>
        ) : (
          clients.map((client) => (
            <div
              key={client.client_id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {client.client_name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Last logged: {client.last_logged}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {client.today_calories.toLocaleString()} cal
                  </div>
                  <div className="text-xs text-gray-500">
                    {client.today_meals} meal
                    {client.today_meals !== 1 ? "s" : ""} today
                  </div>
                </div>
              </div>

              {/* Water intake */}
              {client.today_water_ml > 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                  <Droplets className="w-4 h-4" />
                  <span>{client.today_water_ml}ml water today</span>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(client)}
                >
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(client)}
                >
                  Send Message
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedClient.client_name} - Nutrition Details
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedClient.today_calories.toLocaleString()}
                  </div>
                  <div className="text-sm text-orange-700">Calories Today</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedClient.today_water_ml.toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-700">ml Water Today</div>
                </div>
              </div>

              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {selectedClient.today_meals}
                </div>
                <div className="text-sm text-green-700">Meals Today</div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Activity Status
                </h4>
                <div className="text-sm text-gray-600">
                  <p>
                    <strong>Last Activity:</strong> {selectedClient.last_logged}
                  </p>
                  <p>
                    <strong>Today's Progress:</strong>{" "}
                    {selectedClient.today_meals > 0
                      ? "Active"
                      : "No activity today"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button
                className="flex-1"
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AnalyticsTabProps {
  analytics: {
    totalClients: number;
    activeClients: number;
    loggingRate: number;
    totalCalories: number;
    totalWater: number;
  };
  recentActivity: RecentActivity[];
}

function AnalyticsTab({ analytics, recentActivity }: AnalyticsTabProps) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const renderFoodItems = (foodItems: any[]) => {
    if (!foodItems || foodItems.length === 0) {
      return <div className="text-sm text-gray-500">No food items logged</div>;
    }

    return (
      <div className="space-y-2">
        {foodItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <div className="flex-1">
              <div className="font-medium text-sm">{item.food_name}</div>
              <div className="text-xs text-gray-500">
                {item.quantity} {item.unit}
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="font-medium">{item.calories} cal</div>
              <div className="text-xs text-gray-500">
                P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        Nutrition Analytics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-900">
                {analytics.totalClients}
              </div>
              <div className="text-sm text-blue-700">Total Clients</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-900">
                {analytics.loggingRate}%
              </div>
              <div className="text-sm text-green-700">Logging Rate</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-900">
                {analytics.totalCalories.toLocaleString()}
              </div>
              <div className="text-sm text-purple-700">Total Calories</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h4>
        <div className="space-y-2">
          {recentActivity.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No recent activity
            </div>
          ) : (
            recentActivity.map((activity, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Header - Always visible */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(index)}
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <span className="text-sm text-gray-700">
                      {activity.activity}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      by {activity.client_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {activity.timestamp}
                    </span>
                    {expandedItems.has(index) ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>

                {/* Expandable Content */}
                {expandedItems.has(index) && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4">
                    {activity.type === "log" && activity.details ? (
                      <div className="space-y-4">
                        {/* Meal Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600">
                              {activity.details.total_calories || 0}
                            </div>
                            <div className="text-xs text-gray-500">
                              Calories
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {activity.details.total_protein || 0}g
                            </div>
                            <div className="text-xs text-gray-500">Protein</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {activity.details.total_carbs || 0}g
                            </div>
                            <div className="text-xs text-gray-500">Carbs</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {activity.details.total_fat || 0}g
                            </div>
                            <div className="text-xs text-gray-500">Fat</div>
                          </div>
                        </div>

                        {/* Food Items */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Food Items
                          </h5>
                          {renderFoodItems(activity.details.food_items || [])}
                        </div>

                        {/* Notes */}
                        {activity.details.notes && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Notes
                            </h5>
                            <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                              {activity.details.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : activity.type === "water" && activity.details ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {activity.details.amount_ml}ml
                          </div>
                          <div className="text-sm text-gray-500">
                            Water Intake
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No additional details available
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  difficulty: "Easy" | "Medium" | "Hard";
  ingredients: FoodItem[];
  instructions: string[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  tags: string[];
}

function RecipeBuilderTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    recipeId: string;
    recipeName: string;
  }>({
    isOpen: false,
    recipeId: "",
    recipeName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleCreateRecipe = () => {
    router.push("/nutrition-hub/recipe-builder");
  };

  const handleEditRecipe = (recipeId: string) => {
    router.push(`/nutrition-hub/recipe-builder?edit=${recipeId}`);
  };

  const handleDeleteClick = (recipeId: string, recipeName: string) => {
    setDeleteDialog({
      isOpen: true,
      recipeId,
      recipeName,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await RecipeService.deleteRecipe(deleteDialog.recipeId);
      
      // Remove recipe from local state
      setRecipes(prev => prev.filter(recipe => recipe.id !== deleteDialog.recipeId));
      
      // Close dialog
      setDeleteDialog({
        isOpen: false,
        recipeId: "",
        recipeName: "",
      });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      isOpen: false,
      recipeId: "",
      recipeName: "",
    });
  };

  // Fetch user's recipes
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const userRecipes = await RecipeService.getUserRecipes();
        setRecipes(userRecipes);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Filter recipes based on search
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.short_description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Recipe Builder
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Create and manage custom recipes
          </p>
        </div>
        <Button
          onClick={handleCreateRecipe}
          className="flex items-center gap-2"
        >
          <ChefHat className="w-4 h-4" />
          Create Recipe
        </Button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Recipe List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading recipes...</p>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "No recipes found" : "No recipes yet"}
          </h4>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Create your first recipe to get started"}
          </p>
          <Button onClick={handleCreateRecipe} variant="outline">
            Create Recipe
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative group"
            >
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditRecipe(recipe.id);
                  }}
                  className="p-1.5 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                  title="Edit recipe"
                >
                  <Edit className="w-3.5 h-3.5 text-gray-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(recipe.id, recipe.name);
                  }}
                  className="p-1.5 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-red-50 hover:border-red-200 transition-colors"
                  title="Delete recipe"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                </button>
              </div>

              {recipe.image_url || recipe.cover_photo ? (
                <img
                  src={recipe.image_url || recipe.cover_photo}
                  alt={recipe.name}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-md mb-3 flex items-center justify-center">
                  <ChefHat className="w-8 h-8 text-gray-400" />
                </div>
              )}

              <div className="space-y-2">
                <h5 className="font-semibold text-gray-900 line-clamp-1">
                  {recipe.name}
                </h5>

                {recipe.short_description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {recipe.short_description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>⏱️ {recipe.prep_time + recipe.cook_time || 0} min</span>
                  <span>🍽️ {recipe.servings} servings</span>
                  <span>📊 {recipe.difficulty}</span>
                </div>

                {recipe.dietary_tag && (
                  <div className="inline-block">
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {recipe.dietary_tag}
                    </span>
                  </div>
                )}

                {/* Nutrition Info */}
                <div className="bg-gray-50 rounded-lg p-3 mt-3">
                  <div className="text-xs font-medium text-gray-700 mb-2">Nutrition (per serving)</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calories</span>
                      <span className="font-medium text-green-700">
                        {Math.round((recipe.total_calories || 0) / recipe.servings)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Protein</span>
                      <span className="font-medium text-blue-700">
                        {Math.round((recipe.total_protein || 0) / recipe.servings)}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Carbs</span>
                      <span className="font-medium text-orange-700">
                        {Math.round((recipe.total_carbs || 0) / recipe.servings)}g
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fat</span>
                      <span className="font-medium text-purple-700">
                        {Math.round((recipe.total_fat || 0) / recipe.servings)}g
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-gray-500">
                    Total: {Math.round(recipe.total_calories || 0)} cal
                  </div>
                  <div className="flex items-center gap-1">
                    {recipe.is_public && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Public
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${deleteDialog.recipeName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

interface MealPlan {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  startDate: string;
  endDate: string;
  meals: {
    date: string;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    items: {
      type: "recipe" | "food";
      id: string;
      name: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }[];
  }[];
}

function MealPlanBuilderTab() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedMealType, setSelectedMealType] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("breakfast");

  const handleCreateMealPlan = () => {
    const newMealPlan: MealPlan = {
      id: Date.now().toString(),
      name: "",
      clientId: "",
      clientName: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      meals: [],
    };
    setCurrentMealPlan(newMealPlan);
    setShowCreateModal(true);
  };

  const handleSaveMealPlan = () => {
    if (
      currentMealPlan &&
      currentMealPlan.name.trim() &&
      currentMealPlan.clientId
    ) {
      setMealPlans((prev) => [...prev, currentMealPlan]);
      setShowCreateModal(false);
      setCurrentMealPlan(null);
    }
  };

  const handleAddMeal = () => {
    if (currentMealPlan && selectedDate && selectedMealType) {
      const newMeal = {
        date: selectedDate,
        mealType: selectedMealType,
        items: [],
      };

      setCurrentMealPlan({
        ...currentMealPlan,
        meals: [...currentMealPlan.meals, newMeal],
      });
    }
  };

  const handleAddFoodToMeal = (mealIndex: number, foodItem: any) => {
    if (currentMealPlan) {
      const updatedMeals = [...currentMealPlan.meals];
      updatedMeals[mealIndex].items.push({
        type: "food",
        id: Date.now().toString(),
        name: foodItem.name,
        calories: foodItem.calories,
        protein: foodItem.protein,
        carbs: foodItem.carbs,
        fat: foodItem.fat,
      });

      setCurrentMealPlan({
        ...currentMealPlan,
        meals: updatedMeals,
      });
    }
  };

  const handleAddRecipeToMeal = (mealIndex: number, recipe: Recipe) => {
    if (currentMealPlan) {
      const updatedMeals = [...currentMealPlan.meals];
      updatedMeals[mealIndex].items.push({
        type: "recipe",
        id: recipe.id,
        name: recipe.name,
        calories: recipe.totalCalories,
        protein: recipe.totalProtein,
        carbs: recipe.totalCarbs,
        fat: recipe.totalFat,
      });

      setCurrentMealPlan({
        ...currentMealPlan,
        meals: updatedMeals,
      });
    }
  };

  const handleRemoveMealItem = (mealIndex: number, itemIndex: number) => {
    if (currentMealPlan) {
      const updatedMeals = [...currentMealPlan.meals];
      updatedMeals[mealIndex].items.splice(itemIndex, 1);

      setCurrentMealPlan({
        ...currentMealPlan,
        meals: updatedMeals,
      });
    }
  };

  // Mock data for demonstration
  useEffect(() => {
    setClients([
      { id: "1", name: "Huzefa Khety" },
      { id: "2", name: "Bobby McLiftman" },
    ]);
    setRecipes([
      {
        id: "1",
        name: "Protein Smoothie",
        description: "High protein breakfast smoothie",
        servings: 1,
        prepTime: 5,
        cookTime: 0,
        difficulty: "Easy",
        ingredients: [],
        instructions: [],
        totalCalories: 350,
        totalProtein: 25,
        totalCarbs: 30,
        totalFat: 8,
        tags: ["breakfast", "protein"],
      },
      {
        id: "2",
        name: "Grilled Chicken Salad",
        description: "Healthy lunch option",
        servings: 1,
        prepTime: 10,
        cookTime: 15,
        difficulty: "Medium",
        ingredients: [],
        instructions: [],
        totalCalories: 450,
        totalProtein: 35,
        totalCarbs: 15,
        totalFat: 20,
        tags: ["lunch", "salad"],
      },
    ]);
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Meal Plan Builder
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Create personalized meal plans for your clients
          </p>
        </div>
        <Button
          onClick={handleCreateMealPlan}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Meal Plan
        </Button>
      </div>

      {/* Meal Plans List */}
      <div className="space-y-4">
        {mealPlans.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No meal plans yet
            </h4>
            <p className="text-gray-500 mb-4">
              Create your first meal plan to get started
            </p>
            <Button onClick={handleCreateMealPlan} variant="outline">
              Create Meal Plan
            </Button>
          </div>
        ) : (
          mealPlans.map((mealPlan) => (
            <div
              key={mealPlan.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{mealPlan.name}</h4>
                  <p className="text-sm text-gray-500">
                    For {mealPlan.clientName}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {mealPlan.startDate} - {mealPlan.endDate}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mealPlan.meals.map((meal, mealIndex) => (
                  <div key={mealIndex} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-900 capitalize">
                        {meal.mealType}
                      </h5>
                      <span className="text-xs text-gray-500">{meal.date}</span>
                    </div>

                    <div className="space-y-1">
                      {meal.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-gray-700">{item.name}</span>
                          <span className="text-gray-500">
                            {item.calories} cal
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Meal Plan Modal */}
      {showCreateModal && currentMealPlan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Create Meal Plan
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meal Plan Name *
                  </label>
                  <Input
                    value={currentMealPlan.name}
                    onChange={(e) =>
                      setCurrentMealPlan({
                        ...currentMealPlan,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter meal plan name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client *
                  </label>
                  <select
                    value={currentMealPlan.clientId}
                    onChange={(e) => {
                      const client = clients.find(
                        (c) => c.id === e.target.value
                      );
                      setCurrentMealPlan({
                        ...currentMealPlan,
                        clientId: e.target.value,
                        clientName: client?.name || "",
                      });
                    }}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={currentMealPlan.startDate}
                      onChange={(e) =>
                        setCurrentMealPlan({
                          ...currentMealPlan,
                          startDate: e.target.value,
                        })
                      }
                    />
                    <Input
                      type="date"
                      value={currentMealPlan.endDate}
                      onChange={(e) =>
                        setCurrentMealPlan({
                          ...currentMealPlan,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Add Meal Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Add Meals
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meal Type
                    </label>
                    <select
                      value={selectedMealType}
                      onChange={(e) =>
                        setSelectedMealType(e.target.value as any)
                      }
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleAddMeal}
                      disabled={!selectedDate || !selectedMealType}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Meal
                    </Button>
                  </div>
                </div>

                {/* Meals List */}
                <div className="space-y-4">
                  {currentMealPlan.meals.map((meal, mealIndex) => (
                    <div
                      key={mealIndex}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-900 capitalize">
                          {meal.mealType} - {meal.date}
                        </h5>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Add Food
                          </Button>
                          <Button variant="outline" size="sm">
                            Add Recipe
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {meal.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
                                {item.type}
                              </span>
                              <span className="text-sm font-medium">
                                {item.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {item.calories} cal
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemoveMealItem(mealIndex, itemIndex)
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {meal.items.length === 0 && (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            No items added yet
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveMealPlan}
                disabled={
                  !currentMealPlan.name.trim() || !currentMealPlan.clientId
                }
              >
                <Save className="w-4 h-4 mr-2" />
                Save Meal Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
