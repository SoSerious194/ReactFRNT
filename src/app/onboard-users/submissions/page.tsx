"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Eye,
  MessageSquare,
  Calendar,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/utils/supabase/client";

interface PricingPlan {
  name: string;
  price: number;
  enabled: boolean;
}

interface FormSubmission {
  id: string;
  form_id: string;
  coach_id: string;
  form_data: any;
  submitted_at: string;
  status: "pending" | "reviewed" | "contacted" | "converted";
  notes: string | null;
  form: {
    title: string;
    pricing_plans: PricingPlan[];
  };
}

export default function FormSubmissionsPage() {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("signup_form_submissions")
        .select(
          `
          *,
          form:signup_forms(title, pricing_plans)
        `
        )
        .eq("coach_id", user.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error loading submissions:", error);
      addToast({
        type: "error",
        message: "Failed to load form submissions",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (
    submissionId: string,
    status: string
  ) => {
    try {
      const { error } = await supabase
        .from("signup_form_submissions")
        .update({ status })
        .eq("id", submissionId);

      if (error) throw error;

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === submissionId ? { ...sub, status: status as any } : sub
        )
      );

      addToast({
        type: "success",
        message: "Submission status updated",
      });
    } catch (error) {
      console.error("Error updating submission:", error);
      addToast({
        type: "error",
        message: "Failed to update submission status",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-purple-100 text-purple-800";
      case "converted":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch =
      submission.form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      JSON.stringify(submission.form_data)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || submission.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getFormDataSummary = (formData: any) => {
    const fields = Object.entries(formData);
    if (fields.length === 0) return "No data";

    // Try to get name or email first
    const nameField = fields.find(
      ([key, value]) =>
        key.toLowerCase().includes("name") ||
        key.toLowerCase().includes("email")
    );

    if (nameField) {
      return `${nameField[0]}: ${nameField[1]}`;
    }

    // Return first field
    const firstField = fields[0];
    return `${firstField[0]}: ${firstField[1]}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Form Submissions
            </h1>
            <p className="text-gray-600 mt-2">
              Review and manage signup form submissions from potential clients
            </p>
          </div>
          <Link href="/onboard-users">
            <Button variant="outline">Back to Forms</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
            </select>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MessageSquare className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No submissions yet
              </h3>
              <p className="text-gray-600 mb-4">
                {submissions.length === 0
                  ? "You haven't received any form submissions yet. Share your signup forms to start getting leads!"
                  : "No submissions match your current filters."}
              </p>
              {submissions.length === 0 && (
                <Link href="/onboard-users">
                  <Button className="bg-green-600 hover:bg-green-700">
                    Create Your First Form
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card
                key={submission.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {submission.form.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getFormDataSummary(submission.form_data)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status.charAt(0).toUpperCase() +
                            submission.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(
                              submission.submitted_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {submission.form.pricing_plans?.filter(plan => plan.enabled).length || 0} plans
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement view details modal
                          console.log("View submission details:", submission);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>

                      <select
                        value={submission.status}
                        onChange={(e) =>
                          updateSubmissionStatus(submission.id, e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
