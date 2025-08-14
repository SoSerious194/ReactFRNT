"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/useAuth";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/toast";
import { Settings, Save, RefreshCw } from "lucide-react";

const supabase = createClient();

interface AIMessageSettings {
  id: string;
  coach_id: string;
  is_enabled: boolean;
  max_messages_per_week: number;
  message_types: string[];
  ai_tone: "friendly" | "motivational" | "professional" | "casual";
  personalization_level: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
}

const EVENT_TYPES = [
  { value: "new_pr", label: "New Personal Records" },
  { value: "workout_completed", label: "Workout Completed" },
  { value: "streak_milestone", label: "Streak Milestones" },
  { value: "weight_goal", label: "Weight Goals" },
  { value: "consistency_milestone", label: "Consistency Milestones" },
  { value: "first_workout", label: "First Workout" },
  { value: "program_completion", label: "Program Completion" },
  { value: "exercise_milestone", label: "Exercise Milestones" },
];

const AI_TONES = [
  { value: "friendly", label: "Friendly" },
  { value: "motivational", label: "Motivational" },
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
];

const PERSONALIZATION_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export default function AutomatedMessageSettingsSection() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [settings, setSettings] = useState<AIMessageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    is_enabled: false,
    max_messages_per_week: 5,
    message_types: [] as string[],
    ai_tone: "friendly" as const,
    personalization_level: "medium" as const,
  });

  // Load settings on component mount
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ai_message_settings")
        .select("*")
        .eq("coach_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setSettings(data);
        setFormData({
          is_enabled: data.is_enabled,
          max_messages_per_week: data.max_messages_per_week,
          message_types: data.message_types || [],
          ai_tone: data.ai_tone,
          personalization_level: data.personalization_level,
        });
      } else {
        // Create default settings if none exist
        await createDefaultSettings();
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      addToast({
        type: "error",
        message: "Failed to load AI message settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const defaultSettings = {
        coach_id: user?.id,
        is_enabled: true,
        max_messages_per_week: 5,
        message_types: [
          "new_pr",
          "workout_completed",
          "streak_milestone",
          "first_workout",
        ],
        ai_tone: "friendly" as const,
        personalization_level: "medium" as const,
      };

      const { data, error } = await supabase
        .from("ai_message_settings")
        .insert(defaultSettings)
        .select()
        .single();

      if (error) throw error;

      setSettings(data);
      setFormData({
        is_enabled: data.is_enabled,
        max_messages_per_week: data.max_messages_per_week,
        message_types: data.message_types,
        ai_tone: data.ai_tone,
        personalization_level: data.personalization_level,
      });
    } catch (error) {
      console.error("Error creating default settings:", error);
      addToast({
        type: "error",
        message: "Failed to create default settings",
      });
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);

      const { error } = await supabase.from("ai_message_settings").upsert(
        {
          coach_id: user?.id,
          ...formData,
        },
        {
          onConflict: "coach_id",
        }
      );

      if (error) throw error;

      addToast({
        type: "success",
        message: "AI message settings saved successfully",
      });

      // Reload settings to get updated data
      await loadSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      addToast({
        type: "error",
        message: "Failed to save AI message settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMessageTypeToggle = (eventType: string) => {
    setFormData((prev) => ({
      ...prev,
      message_types: prev.message_types.includes(eventType)
        ? prev.message_types.filter((type) => type !== eventType)
        : [...prev.message_types, eventType],
    }));
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Automated Message Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Configure AI-powered automated messages for your clients
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSettings} disabled={saving}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={saveSettings} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        {/* Main Settings */}
        <div className="grid gap-6">
          {/* Enable/Disable AI Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                AI Message System
              </CardTitle>
              <CardDescription>
                Enable or disable automated AI messages for your clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="ai-enabled"
                  checked={formData.is_enabled}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_enabled: checked as boolean,
                    }))
                  }
                />
                <div>
                  <label htmlFor="ai-enabled" className="text-base font-medium">
                    Enable AI Messages
                  </label>
                  <p className="text-sm text-gray-600 mt-1">
                    When enabled, AI will automatically send personalized
                    messages to clients based on their activities
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Message Limits</CardTitle>
              <CardDescription>
                Control how many AI messages can be sent per client per week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="max-messages" className="text-sm font-medium">
                    Maximum Messages per Week
                  </label>
                  <Input
                    id="max-messages"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.max_messages_per_week}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        max_messages_per_week: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    This prevents spam and ensures quality engagement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Tone */}
          <Card>
            <CardHeader>
              <CardTitle>AI Message Tone</CardTitle>
              <CardDescription>
                Choose the tone and style of AI-generated messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label htmlFor="ai-tone" className="text-sm font-medium">
                    Message Tone
                  </label>
                  <Select
                    value={formData.ai_tone}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({ ...prev, ai_tone: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_TONES.map((tone) => (
                        <SelectItem key={tone.value} value={tone.value}>
                          {tone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label
                    htmlFor="personalization"
                    className="text-sm font-medium"
                  >
                    Personalization Level
                  </label>
                  <Select
                    value={formData.personalization_level}
                    onValueChange={(value: any) =>
                      setFormData((prev) => ({
                        ...prev,
                        personalization_level: value,
                      }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERSONALIZATION_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600 mt-1">
                    Higher personalization includes more client-specific details
                    and context
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Event Types */}
          <Card>
            <CardHeader>
              <CardTitle>Trigger Events</CardTitle>
              <CardDescription>
                Select which events should trigger automated AI messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EVENT_TYPES.map((eventType) => (
                  <div
                    key={eventType.value}
                    className="flex items-center space-x-3"
                  >
                    <Checkbox
                      id={eventType.value}
                      checked={formData.message_types.includes(eventType.value)}
                      onCheckedChange={() =>
                        handleMessageTypeToggle(eventType.value)
                      }
                    />
                    <label
                      htmlFor={eventType.value}
                      className="text-sm font-medium"
                    >
                      {eventType.label}
                    </label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Selected events: {formData.message_types.length} of{" "}
                  {EVENT_TYPES.length}
                </p>
                {formData.message_types.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.message_types.map((type) => {
                      const eventType = EVENT_TYPES.find(
                        (et) => et.value === type
                      );
                      return (
                        <Badge key={type} variant="secondary">
                          {eventType?.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          {settings && (
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
                <CardDescription>
                  Overview of your current AI message settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {settings.is_enabled ? "Active" : "Inactive"}
                    </div>
                    <div className="text-sm text-gray-600">Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {settings.max_messages_per_week}
                    </div>
                    <div className="text-sm text-gray-600">
                      Max Messages/Week
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {settings.message_types.length}
                    </div>
                    <div className="text-sm text-gray-600">Event Types</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 capitalize">
                      {settings.ai_tone}
                    </div>
                    <div className="text-sm text-gray-600">Tone</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
