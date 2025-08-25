"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import SignupFormBuilder from "@/components/SignupFormBuilder";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/toast";

interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  orderIndex: number;
  options?: any;
  validationRules?: any;
  defaultValue?: string;
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  cssClass?: string;
  helpText?: string;
  dropdownOptions?: string[];
  checklistOptions?: string[];
  radioOptions?: string[];
  rangeMin?: number;
  rangeMax?: number;
  rangeStep?: number;
}

interface SignupFormData {
  id?: string;
  title: string;
  description: string;
  pricing_type: "monthly" | "yearly";
  price: number;
  is_active: boolean;
  elements: FormElement[];
}

export default function EditSignupFormPage() {
  const params = useParams();
  const formId = params.formId as string;
  const [form, setForm] = useState<SignupFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("signup_forms")
        .select("*")
        .eq("id", formId)
        .eq("coach_id", user.id)
        .single();

      if (error) throw error;
      setForm(data);
    } catch (error) {
      console.error("Error loading form:", error);
      addToast({
        type: "error",
        message: "Failed to load form",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Form not found
          </h2>
          <p className="text-gray-600">
            The form you're looking for doesn't exist or you don't have
            permission to edit it.
          </p>
        </div>
      </div>
    );
  }

  return <SignupFormBuilder initialForm={form} mode="edit" />;
}
