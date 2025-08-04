"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  FileText,
  Users,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import {
  FormService,
  FormWithElements,
  FormResponseWithDetails,
} from "@/lib/formServices";
import { useAuth } from "@/lib/useAuth";

export default function FormsPage() {
  const [activeTab, setActiveTab] = useState("forms");
  const [form, setForm] = useState<FormWithElements | null>(null);
  const [responses, setResponses] = useState<FormResponseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const formService = new FormService();

  useEffect(() => {
    if (!authLoading && user) {
      loadForm();
    }
  }, [authLoading, user]);

  const loadForm = async () => {
    setLoading(true);
    try {
      // Check if tables exist first
      const tablesExist = await formService.checkTablesExist();
      if (!tablesExist) {
        console.error(
          "Database tables don't exist. Please run the SQL schema first."
        );
        return;
      }

      // Get coach ID from authenticated user
      if (!user) {
        console.error("No authenticated user found.");
        return;
      }
      const coachId = user.id;
      const formData = await formService.getFormByCoachId(coachId);
      setForm(formData);

      if (formData) {
        const responsesData = await formService.getFormResponses(formData.id);
        setResponses(responsesData);
      }
    } catch (error) {
      console.error("Error loading form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async () => {
    if (!form) return;

    setDeleting(true);
    try {
      const success = await formService.deleteForm(form.id);
      if (success) {
        setForm(null);
        setResponses([]);
      }
    } catch (error) {
      console.error("Error deleting form:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Forms & Questionnaires
        </h1>
        <p className="text-lg text-gray-600">
          Create custom forms to collect information from your clients
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger
            value="forms"
            className="flex items-center justify-center gap-2 px-4 py-2 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <FileText className="w-4 h-4" />
            Forms
          </TabsTrigger>
          <TabsTrigger
            value="responses"
            className="flex items-center justify-center gap-2 px-4 py-2 text-base font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all"
          >
            <Users className="w-4 h-4" />
            Responses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forms" className="mt-8">
          <FormsTab
            form={form}
            onDelete={handleDeleteForm}
            deleting={deleting}
          />
        </TabsContent>

        <TabsContent value="responses" className="mt-8">
          <ResponsesTab responses={responses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface FormsTabProps {
  form: FormWithElements | null;
  onDelete: () => void;
  deleting: boolean;
}

function FormsTab({ form, onDelete, deleting }: FormsTabProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {!form ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No forms created yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first form to start collecting information from your
            clients
          </p>
          <Link href="/training-hub/forms/create">
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create New Form
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {form.title}
              </h3>
              {form.description && (
                <p className="text-gray-600 mt-1">{form.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Link href={`/training-hub/forms/${form.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                  Edit Form
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                disabled={deleting}
                style={{
                  backgroundColor: "#ff0000",
                  color: "#ffffff",
                }}
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? "Deleting..." : "Delete Form"}
              </Button>
            </div>
          </div>

          {/* Form Preview */}
          <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-4">
              Form Preview
            </h4>
            <div className="space-y-4">
              {form.form_elements
                .sort((a, b) => a.order_index - b.order_index)
                .map((element) => (
                  <div key={element.id} className="bg-white p-4 rounded border">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {element.label}
                      </span>
                      {element.required && (
                        <span className="text-red-500 text-sm">*</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {element.placeholder || `${element.element_type} field`}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ResponsesTabProps {
  responses: FormResponseWithDetails[];
}

// Expandable Response Card Component
function ResponseCard({ response }: { response: FormResponseWithDetails }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderResponseData = (response: FormResponseWithDetails) => {
    if (!response.responses || typeof response.responses !== "object") {
      return (
        <div className="text-sm text-gray-600">No response data available</div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(response.responses).map(
          ([fieldId, value]: [string, any]) => {
            // Find the form element to get the label
            const formElement = response.form?.form_elements?.find(
              (element) => element.id === fieldId
            );
            const label = formElement?.label || fieldId;

            return (
              <div key={fieldId} className="bg-gray-50 rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {label}
                </div>
                <div className="text-sm text-gray-600">
                  {Array.isArray(value)
                    ? value.join(", ")
                    : String(value || "No response")}
                </div>
              </div>
            );
          }
        )}
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="bg-white p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {response.client.full_name || "Anonymous"}
              </div>
              <div className="text-sm text-gray-500">
                {response.client.email}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {response.submitted_at
              ? new Date(response.submitted_at).toLocaleDateString()
              : "Unknown"}
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Form Responses
            </h4>
          </div>
          {renderResponseData(response)}
        </div>
      )}
    </div>
  );
}

function ResponsesTab({ responses }: ResponsesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResponses, setFilteredResponses] =
    useState<FormResponseWithDetails[]>(responses);

  // Filter responses based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResponses(responses);
      return;
    }

    const filtered = responses.filter((response) => {
      const fullName = response.client.full_name || "";
      const email = response.client.email || "";
      const query = searchQuery.toLowerCase();

      return (
        fullName.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query)
      );
    });

    setFilteredResponses(filtered);
  }, [searchQuery, responses]);

  const handleExportResponses = () => {
    if (filteredResponses.length === 0) {
      alert("No responses to export");
      return;
    }

    // Get all unique field labels from all responses
    const allFieldLabels = new Set<string>();
    filteredResponses.forEach((response) => {
      if (response.responses && typeof response.responses === "object") {
        Object.entries(response.responses).forEach(([fieldId, value]) => {
          const formElement = response.form?.form_elements?.find(
            (element) => element.id === fieldId
          );
          const label = formElement?.label || fieldId;
          allFieldLabels.add(label);
        });
      }
    });

    const fieldLabels = Array.from(allFieldLabels).sort();

    // Create CSV headers
    const headers = ["Name", "Email", "Submitted Date", ...fieldLabels];

    // Create CSV rows
    const csvRows = filteredResponses.map((response) => {
      const name = response.client.full_name || "Anonymous";
      const email = response.client.email || "";
      const date = response.submitted_at
        ? new Date(response.submitted_at).toLocaleDateString()
        : "Unknown";

      // Create a map of field labels to values for this response
      const responseMap = new Map<string, string>();
      if (response.responses && typeof response.responses === "object") {
        Object.entries(response.responses).forEach(([fieldId, value]) => {
          const formElement = response.form?.form_elements?.find(
            (element) => element.id === fieldId
          );
          const label = formElement?.label || fieldId;
          const formattedValue = Array.isArray(value)
            ? value.join(", ")
            : String(value || "No response");
          responseMap.set(label, formattedValue);
        });
      }

      // Create row with all fields
      const row = [
        `"${name}"`,
        `"${email}"`,
        `"${date}"`,
        ...fieldLabels.map((label) => `"${responseMap.get(label) || ""}"`),
      ];

      return row.join(",");
    });

    // Combine headers and rows
    const csvContent = [headers.join(","), ...csvRows].join("\n");

    // Create and download CSV file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `form-responses-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {responses.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No responses yet
          </h3>
          <p className="text-gray-600">
            Client responses will appear here once they start filling out your
            form
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Client Responses ({filteredResponses.length} of {responses.length}
              )
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportResponses}
              disabled={filteredResponses.length === 0}
            >
              Export Responses
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>

          <div className="space-y-4">
            {filteredResponses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No responses match your search criteria
              </div>
            ) : (
              filteredResponses.map((response) => (
                <ResponseCard key={response.id} response={response} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
