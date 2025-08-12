"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";
import { MessageSchedulerServices } from "@/lib/messageSchedulerServices";
import {
  MessageTemplate,
  ScheduledMessage,
  CreateMessageTemplateRequest,
  CreateScheduledMessageRequest,
  TemplateGenerationRequest,
  MESSAGE_CATEGORIES,
  SCHEDULE_TYPES,
  DAYS_OF_WEEK,
} from "@/types/messageScheduler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Copy,
  Sparkles,
} from "lucide-react";
import { format, addDays, addWeeks, addMonths } from "date-fns";

interface User {
  id: string;
  full_name: string;
  email: string;
}

export default function MessageSchedulerSection() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("scheduler");

  // Templates state
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  // Scheduled messages state
  const [scheduledMessages, setScheduledMessages] = useState<
    ScheduledMessage[]
  >([]);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(false);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Scheduler form state
  const [schedulerForm, setSchedulerForm] = useState({
    title: "",
    content: "",
    template_id: "",
    schedule_type: "once" as "once" | "5min" | "daily" | "weekly" | "monthly",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    start_time: "09:00",
    target_type: "all" as "all" | "specific",
    target_user_ids: [] as string[],
    frequency_config: {} as any,
  });

  // Template generation state
  const [generationForm, setGenerationForm] = useState({
    category: "general" as
      | "sales"
      | "check-in"
      | "motivation"
      | "reminder"
      | "general",
    context: "",
    tone: "friendly" as "professional" | "friendly" | "motivational" | "casual",
    target_audience: "",
    specific_goals: [] as string[],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState<any>(null);

  // Dialog states
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showGenerationDialog, setShowGenerationDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] =
    useState<MessageTemplate | null>(null);
  const [editingScheduled, setEditingScheduled] =
    useState<ScheduledMessage | null>(null);

  // Template creation state
  const [templateCreationMode, setTemplateCreationMode] = useState<
    "manual" | "ai"
  >("manual");
  const [templateForm, setTemplateForm] = useState({
    title: "",
    content: "",
    category: "general" as
      | "sales"
      | "check-in"
      | "motivation"
      | "reminder"
      | "general",
  });
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadTemplates();
      loadScheduledMessages();
      loadUsers();
    }
  }, [user]);

  const loadTemplates = async () => {
    if (!user) return;
    setIsLoadingTemplates(true);
    try {
      const data = await MessageSchedulerServices.getTemplates(user.id);
      setTemplates(data);
    } catch (error) {
      console.error("Failed to load templates:", error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const loadScheduledMessages = async () => {
    if (!user) return;
    setIsLoadingScheduled(true);
    try {
      const data = await MessageSchedulerServices.getScheduledMessages(user.id);
      setScheduledMessages(data);
    } catch (error) {
      console.error("Failed to load scheduled messages:", error);
    } finally {
      setIsLoadingScheduled(false);
    }
  };

  const loadUsers = async () => {
    if (!user) return;
    setIsLoadingUsers(true);
    try {
      const data = await MessageSchedulerServices.getAssignedUsers(user.id);
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!user) return;

    if (templateCreationMode === "ai") {
      if (!templateForm.category) return;

      setIsGeneratingTemplate(true);
      try {
        const request: TemplateGenerationRequest = {
          category: templateForm.category,
          context: "",
          tone: "friendly",
          target_audience: "",
          specific_goals: [],
        };

        const result = await MessageSchedulerServices.generateTemplate(request);

        // Create template with generated content
        const templateRequest: CreateMessageTemplateRequest = {
          title: result.title,
          content: result.content,
          category: templateForm.category,
        };

        await MessageSchedulerServices.createTemplate(user.id, templateRequest);

        // Reset form and close dialog
        setTemplateForm({
          title: "",
          content: "",
          category: "general",
        });
        setTemplateCreationMode("manual");
        setShowTemplateDialog(false);
        loadTemplates();
      } catch (error) {
        console.error("Failed to generate and create template:", error);
      } finally {
        setIsGeneratingTemplate(false);
      }
    } else {
      if (!templateForm.title || !templateForm.content) return;

      try {
        const request: CreateMessageTemplateRequest = {
          title: templateForm.title,
          content: templateForm.content,
          category: templateForm.category,
        };

        await MessageSchedulerServices.createTemplate(user.id, request);
        setTemplateForm({
          title: "",
          content: "",
          category: "general",
        });
        loadTemplates();
      } catch (error) {
        console.error("Failed to create template:", error);
      }
    }
  };

  const handleScheduleMessage = async () => {
    if (!user || !schedulerForm.title || !schedulerForm.content) return;

    try {
      const request: CreateScheduledMessageRequest = {
        title: schedulerForm.title,
        content: schedulerForm.content,
        template_id: schedulerForm.template_id || undefined,
        schedule_type: schedulerForm.schedule_type,
        start_date: schedulerForm.start_date,
        end_date: schedulerForm.end_date || undefined,
        start_time: schedulerForm.start_time,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        frequency_config:
          Object.keys(schedulerForm.frequency_config).length > 0
            ? schedulerForm.frequency_config
            : undefined,
        target_type: schedulerForm.target_type,
        target_user_ids: schedulerForm.target_user_ids,
      };

      await MessageSchedulerServices.createScheduledMessage(user.id, request);

      // Reset form
      setSchedulerForm({
        title: "",
        content: "",
        template_id: "",
        schedule_type: "once",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: "",
        start_time: "09:00",
        target_type: "all",
        target_user_ids: [],
        frequency_config: {},
      });

      loadScheduledMessages();
    } catch (error) {
      console.error("Failed to schedule message:", error);
    }
  };

  const handleGenerateTemplate = async () => {
    if (!generationForm.category) return;

    setIsGenerating(true);
    try {
      const request: TemplateGenerationRequest = {
        category: generationForm.category,
        context: generationForm.context,
        tone: generationForm.tone,
        target_audience: generationForm.target_audience,
        specific_goals: generationForm.specific_goals,
      };

      const result = await MessageSchedulerServices.generateTemplate(request);
      setGeneratedTemplate(result);
    } catch (error) {
      console.error("Failed to generate template:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseGeneratedTemplate = () => {
    if (!generatedTemplate) return;

    setSchedulerForm({
      ...schedulerForm,
      title: generatedTemplate.title,
      content: generatedTemplate.content,
    });

    setShowGenerationDialog(false);
    setGeneratedTemplate(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSchedulerForm({
        ...schedulerForm,
        title: template.title,
        content: template.content,
        template_id: template.id,
      });
    }
  };

  const handleUserToggle = (userId: string) => {
    setSchedulerForm((prev) => ({
      ...prev,
      target_user_ids: prev.target_user_ids.includes(userId)
        ? prev.target_user_ids.filter((id: string) => id !== userId)
        : [...prev.target_user_ids, userId],
    }));
  };

  const handlePauseResume = async (
    messageId: string,
    currentStatus: string
  ) => {
    if (!user) return;

    try {
      if (currentStatus === "active") {
        await MessageSchedulerServices.pauseScheduledMessage(
          user.id,
          messageId
        );
      } else {
        await MessageSchedulerServices.resumeScheduledMessage(
          user.id,
          messageId
        );
      }
      loadScheduledMessages();
    } catch (error) {
      console.error("Failed to update message status:", error);
    }
  };

  const handleDeleteScheduled = async (messageId: string) => {
    if (!user) return;

    try {
      await MessageSchedulerServices.deleteScheduledMessage(user.id, messageId);
      loadScheduledMessages();
    } catch (error) {
      console.error("Failed to delete scheduled message:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScheduleTypeLabel = (type: string) => {
    switch (type) {
      case "once":
        return "One-time";
      case "5min":
        return "Every 5 Minutes";
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      default:
        return type;
    }
  };

  const getLocalTimeDisplay = (date: string, time: string) => {
    try {
      const dateTimeString = `${date}T${time}`;
      const localDate = new Date(dateTimeString);
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      return localDate.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      });
    } catch (error) {
      return `${date} at ${time}`;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        <div>
          <h2 className="text-xl font-semibold">Message Scheduler</h2>
          <p className="text-sm text-gray-600">
            Schedule and manage automated messages
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowGenerationDialog(true)}>
            <Sparkles className="w-4 h-4 mr-2" />
            AI Template
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col min-h-0"
      >
        <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
          <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
        </TabsList>

        <TabsContent
          value="scheduler"
          className="flex-1 p-4 space-y-4 overflow-y-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle>Schedule New Message</CardTitle>
              <CardDescription>
                Create and schedule a message for your clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Message Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Message Title</label>
                <Input
                  placeholder="Enter message title"
                  value={schedulerForm.title}
                  onChange={(e) =>
                    setSchedulerForm({
                      ...schedulerForm,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message Content</label>
                <Textarea
                  placeholder="Enter your message content..."
                  value={schedulerForm.content}
                  onChange={(e) =>
                    setSchedulerForm({
                      ...schedulerForm,
                      content: e.target.value,
                    })
                  }
                  rows={4}
                />
              </div>

              {/* Template Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Use Template (Optional)
                </label>
                <Select
                  value={schedulerForm.template_id}
                  onValueChange={handleTemplateSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scheduling Options */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Schedule Type</label>
                  <Select
                    value={schedulerForm.schedule_type}
                    onValueChange={(value: any) =>
                      setSchedulerForm({
                        ...schedulerForm,
                        schedule_type: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SCHEDULE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {getScheduleTypeLabel(type)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={schedulerForm.start_date}
                    onChange={(e) =>
                      setSchedulerForm({
                        ...schedulerForm,
                        start_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Input
                    type="time"
                    value={schedulerForm.start_time}
                    onChange={(e) =>
                      setSchedulerForm({
                        ...schedulerForm,
                        start_time: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    End Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={schedulerForm.end_date}
                    onChange={(e) =>
                      setSchedulerForm({
                        ...schedulerForm,
                        end_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Time Preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Message will be sent:</strong>{" "}
                  {schedulerForm.schedule_type === "5min"
                    ? "Every 5 minutes starting immediately"
                    : getLocalTimeDisplay(
                        schedulerForm.start_date,
                        schedulerForm.start_time
                      )}
                </p>
              </div>

              {/* Frequency Configuration */}
              {schedulerForm.schedule_type === "weekly" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Days of Week</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS_OF_WEEK.map((day, index) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={`day-${index}`}
                          checked={schedulerForm.frequency_config.dayOfWeek?.includes(
                            index
                          )}
                          onCheckedChange={(checked) => {
                            const current =
                              schedulerForm.frequency_config.dayOfWeek || [];
                            const updated = checked
                              ? [...current, index]
                              : current.filter((d: number) => d !== index);
                            setSchedulerForm({
                              ...schedulerForm,
                              frequency_config: {
                                ...schedulerForm.frequency_config,
                                dayOfWeek: updated,
                              },
                            });
                          }}
                        />
                        <label htmlFor={`day-${index}`} className="text-sm">
                          {day}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Targeting Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <Select
                  value={schedulerForm.target_type}
                  onValueChange={(value: any) =>
                    setSchedulerForm({ ...schedulerForm, target_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="specific">Specific Clients</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {schedulerForm.target_type === "specific" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Clients</label>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={schedulerForm.target_user_ids.includes(
                            user.id
                          )}
                          onCheckedChange={() => handleUserToggle(user.id)}
                        />
                        <label htmlFor={`user-${user.id}`} className="text-sm">
                          {user.full_name} ({user.email})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleScheduleMessage} className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Message Templates</h3>
              <Button onClick={() => setShowTemplateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>

            {isLoadingTemplates ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No templates created yet</p>
                  <Button
                    onClick={() => setShowTemplateDialog(true)}
                    className="mt-2"
                  >
                    Create First Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {templates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {template.title}
                        </CardTitle>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{template.content}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Created{" "}
                          {format(new Date(template.created_at), "MMM d, yyyy")}
                        </span>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSchedulerForm({
                                ...schedulerForm,
                                title: template.title,
                                content: template.content,
                                template_id: template.id,
                              });
                              setActiveTab("scheduler");
                            }}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Use
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scheduled Messages</h3>

            {isLoadingScheduled ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">
                  Loading scheduled messages...
                </p>
              </div>
            ) : scheduledMessages.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No scheduled messages</p>
                  <Button
                    onClick={() => setActiveTab("scheduler")}
                    className="mt-2"
                  >
                    Schedule First Message
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {scheduledMessages.map((message) => (
                  <Card key={message.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {message.title}
                        </CardTitle>
                        <Badge className={getStatusColor(message.status)}>
                          {message.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{message.content}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Schedule:</span>
                          <p className="text-gray-600">
                            {getScheduleTypeLabel(message.schedule_type)} •{" "}
                            {format(
                              new Date(message.start_date),
                              "MMM d, yyyy"
                            )}{" "}
                            at {message.start_time}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Target:</span>
                          <p className="text-gray-600">
                            {message.target_type === "all"
                              ? "All Clients"
                              : `${message.target_user_ids.length} specific clients`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-500">
                          {message.last_sent_at && (
                            <span>
                              Last sent:{" "}
                              {format(
                                new Date(message.last_sent_at),
                                "MMM d, yyyy HH:mm"
                              )}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePauseResume(message.id, message.status)
                            }
                          >
                            {message.status === "active" ? (
                              <>
                                <Pause className="w-4 h-4 mr-1" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-1" />
                                Resume
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteScheduled(message.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Template Generation Dialog */}
      <Dialog
        open={showGenerationDialog}
        onOpenChange={setShowGenerationDialog}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Generate AI Template</DialogTitle>
            <DialogDescription>
              Use AI to generate message templates based on your specifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={generationForm.category}
                  onValueChange={(value: any) =>
                    setGenerationForm({ ...generationForm, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MESSAGE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <Select
                  value={generationForm.tone}
                  onValueChange={(value: any) =>
                    setGenerationForm({ ...generationForm, tone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="motivational">Motivational</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Context (Optional)</label>
              <Textarea
                placeholder="Describe the context or situation for this message..."
                value={generationForm.context}
                onChange={(e) =>
                  setGenerationForm({
                    ...generationForm,
                    context: e.target.value,
                  })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Target Audience (Optional)
              </label>
              <Input
                placeholder="e.g., beginners, advanced clients, weight loss focus..."
                value={generationForm.target_audience}
                onChange={(e) =>
                  setGenerationForm({
                    ...generationForm,
                    target_audience: e.target.value,
                  })
                }
              />
            </div>

            <Button
              onClick={handleGenerateTemplate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Template
                </>
              )}
            </Button>

            {generatedTemplate && (
              <div className="border rounded-lg p-4 space-y-4">
                <h4 className="font-medium">Generated Template</h4>
                <div>
                  <p className="font-medium text-sm">Title:</p>
                  <p className="text-gray-600">{generatedTemplate.title}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Content:</p>
                  <p className="text-gray-600">{generatedTemplate.content}</p>
                </div>
                <div>
                  <p className="font-medium text-sm">Suggestions:</p>
                  <ul className="text-gray-600 text-sm space-y-1">
                    {generatedTemplate.suggestions.map(
                      (suggestion: string, index: number) => (
                        <li key={index}>• {suggestion}</li>
                      )
                    )}
                  </ul>
                </div>
                <Button onClick={handleUseGeneratedTemplate} className="w-full">
                  Use This Template
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Creation Dialog */}
      <Dialog
        open={showTemplateDialog}
        onOpenChange={(open) => {
          setShowTemplateDialog(open);
          if (!open) {
            // Reset form when dialog closes
            setTemplateForm({
              title: "",
              content: "",
              category: "general",
            });
            setTemplateCreationMode("manual");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a reusable message template manually or with AI
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Creation Mode Toggle */}
            <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setTemplateCreationMode("manual")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  templateCreationMode === "manual"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setTemplateCreationMode("ai")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  templateCreationMode === "ai"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Sparkles className="w-4 h-4 mr-1 inline" />
                AI Generate
              </button>
            </div>

            {templateCreationMode === "manual" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Title</label>
                  <Input
                    placeholder="Enter template title"
                    value={templateForm.title}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Template Content
                  </label>
                  <Textarea
                    placeholder="Enter template content..."
                    value={templateForm.content}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        content: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={templateForm.category}
                    onValueChange={(value: any) =>
                      setTemplateForm({ ...templateForm, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {MESSAGE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">
                        AI Template Generation
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Select a category and AI will generate a professional
                        template for you.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select
                    value={templateForm.category}
                    onValueChange={(value: any) =>
                      setTemplateForm({ ...templateForm, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {MESSAGE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateTemplate}
              className="w-full"
              disabled={isGeneratingTemplate}
            >
              {isGeneratingTemplate ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : templateCreationMode === "ai" ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate & Create Template
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
