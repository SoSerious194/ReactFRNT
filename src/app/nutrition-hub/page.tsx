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
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";

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
        <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="clients"
            className="flex items-center justify-center gap-2 px-4 py-2 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <Users className="w-4 h-4" />
            Client Nutrition
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center justify-center gap-2 px-4 py-2 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
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
