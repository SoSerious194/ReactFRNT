"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Droplets,
  Plus,
  Minus,
  Save,
  Loader2,
} from "lucide-react";
import { NutritionService } from "@/lib/nutritionServices";
import { useAuth } from "@/lib/useAuth";

interface WaterLoggerProps {
  clientId?: string;
  onLogComplete?: () => void;
}

export default function WaterLogger({ clientId, onLogComplete }: WaterLoggerProps) {
  const [amount, setAmount] = useState(250); // Default 250ml
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const nutritionService = new NutritionService();

  const quickAmounts = [100, 250, 500, 750, 1000];

  const handleLogWater = async () => {
    if (!user || amount <= 0) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const result = await nutritionService.createWaterLog(
        clientId || user.id,
        user.id, // Assuming the logged-in user is the coach
        today,
        amount
      );
      
      if (result) {
        setAmount(250); // Reset to default
        onLogComplete?.();
      }
    } catch (error) {
      console.error("Error logging water:", error);
    } finally {
      setLoading(false);
    }
  };

  const addAmount = (addAmount: number) => {
    setAmount(prev => prev + addAmount);
  };

  const subtractAmount = (subtractAmount: number) => {
    setAmount(prev => Math.max(0, prev - subtractAmount));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="w-5 h-5" />
          Log Water Intake
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (ml)
            </label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => subtractAmount(100)}
                disabled={amount < 100}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="text-center"
                min="0"
                step="50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => addAmount(100)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Add
            </label>
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => addAmount(quickAmount)}
                  className="text-xs"
                >
                  +{quickAmount}ml
                </Button>
              ))}
            </div>
          </div>

          {/* Current Amount Display */}
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-900">
              {amount}ml
            </div>
            <div className="text-sm text-blue-700">
              {Math.round(amount / 1000 * 10) / 10}L
            </div>
          </div>

          {/* Log Button */}
          <Button
            onClick={handleLogWater}
            disabled={loading || amount <= 0}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging Water...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Log Water Intake
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 