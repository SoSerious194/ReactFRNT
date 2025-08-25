"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Copy,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/utils/supabase/client";

interface SignupForm {
  id: string;
  title: string;
  description: string;
  pricing_type: "monthly" | "yearly";
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function OnboardUsersPage() {
  const [forms, setForms] = useState<SignupForm[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("signup_forms")
        .select("*")
        .eq("coach_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setForms(data || []);
    } catch (error) {
      console.error("Error loading forms:", error);
      addToast({
        type: "error",
        message: "Failed to load signup forms",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyFormLink = async (formId: string) => {
    const link = `${window.location.origin}/signup/${formId}`;
    try {
      await navigator.clipboard.writeText(link);
      addToast({
        type: "success",
        message: "Form link has been copied to clipboard",
      });
    } catch (error) {
      addToast({
        type: "error",
        message: "Failed to copy link",
      });
    }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;

    try {
      const { error } = await supabase
        .from("signup_forms")
        .delete()
        .eq("id", formId);

      if (error) throw error;

      setForms(forms.filter((form) => form.id !== formId));
      addToast({
        type: "success",
        message: "Signup form has been deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting form:", error);
      addToast({
        type: "error",
        message: "Failed to delete form",
      });
    }
  };

  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
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
            <h1 className="text-3xl font-bold text-gray-900">Onboard Users</h1>
            <p className="text-gray-600 mt-2">
              Create custom signup forms to onboard new clients
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/onboard-users/submissions">
              <Button variant="outline">View Submissions</Button>
            </Link>
            <Link href="/onboard-users/create">
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Form
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search forms by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Forms Grid */}
        {filteredForms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No signup forms yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first signup form to start onboarding clients
              </p>
              <Link href="/onboard-users/create">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Form
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">
                        {form.title}
                      </CardTitle>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {form.description}
                      </p>
                    </div>
                    <Badge variant={form.is_active ? "default" : "secondary"}>
                      {form.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Pricing Info */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">${form.price}</span>
                    <span>/</span>
                    <Calendar className="w-4 h-4" />
                    <span>{form.pricing_type}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyFormLink(form.id)}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy Link
                    </Button>
                    <Link href={`/onboard-users/edit/${form.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteForm(form.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Preview Link */}
                  <div className="mt-3">
                    <Link
                      href={`/signup/${form.id}`}
                      target="_blank"
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Preview Form
                    </Link>
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
