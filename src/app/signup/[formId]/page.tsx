"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, CreditCard } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  orderIndex: number;
  helpText?: string;
  dropdownOptions?: string[];
  checklistOptions?: string[];
  radioOptions?: string[];
}

interface PricingPlan {
  name: string;
  price: number;
  enabled: boolean;
}

interface SignupForm {
  id: string;
  title: string;
  description: string;
  pricing_plans: PricingPlan[];
  is_active: boolean;
  elements: FormElement[];
  coach_id: string;
}

interface FormSubmission {
  [key: string]: any;
}

export default function PublicSignupFormPage() {
  const params = useParams();
  const formId = params.formId as string;
  const [form, setForm] = useState<SignupForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormSubmission>({});
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadForm();
  }, [formId]);

  const loadForm = async () => {
    try {
      const { data, error } = await supabase
        .from("signup_forms")
        .select("*")
        .eq("id", formId)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setForm(data);
    } catch (error) {
      console.error("Error loading form:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (elementId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [elementId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = form?.elements.filter((el) => el.required) || [];
      const missingFields = requiredFields.filter(
        (field) => !formData[field.id] || formData[field.id] === ""
      );

      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields
            .map((f) => f.label)
            .join(", ")}`
        );
        return;
      }

      // Validate that email and password fields exist
      const emailField = form?.elements.find((el) => el.type === "email");
      const passwordField = form?.elements.find((el) => el.type === "password");

      const email = emailField ? formData[emailField.id] : null;
      const password = passwordField ? formData[passwordField.id] : null;

      if (!email || !password) {
        alert("Email and password are required for payment processing.");
        return;
      }

      // Validate that a pricing plan is selected
      if (!selectedPlan) {
        alert("Please select a pricing plan.");
        return;
      }

      // Create checkout session with all form data
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          formId,
          formData,
          selectedPlan,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || "Failed to create checkout session";

        // Handle specific error cases
        if (errorMessage.includes("already exists")) {
          alert(
            "A user with this email address already exists. Please use a different email or try logging in."
          );
        } else {
          alert(errorMessage);
        }

        throw new Error(errorMessage);
      }

      const { checkoutUrl } = await response.json();

      if (!checkoutUrl) {
        throw new Error("No checkout URL received");
      }

      setProcessingPayment(true);

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Error processing payment:", error);
      alert(error);
    } finally {
      setSubmitting(false);
      setProcessingPayment(false);
    }
  };

  const renderFormElement = (element: FormElement) => {
    switch (element.type) {
      case "full_name":
      case "email":
      case "phone":
      case "short_text":
        return (
          <Input
            placeholder={element.placeholder || "Enter text..."}
            value={formData[element.id] || ""}
            onChange={(e) => handleInputChange(element.id, e.target.value)}
            required={element.required}
            className="w-full"
          />
        );

      case "password":
        return (
          <Input
            type="password"
            placeholder={element.placeholder || "Enter password..."}
            value={formData[element.id] || ""}
            onChange={(e) => handleInputChange(element.id, e.target.value)}
            required={element.required}
            className="w-full"
          />
        );

      case "fitness_goals":
      case "injuries_limitations":
      case "paragraph":
        return (
          <Textarea
            placeholder={element.placeholder || "Enter text..."}
            value={formData[element.id] || ""}
            onChange={(e) => handleInputChange(element.id, e.target.value)}
            required={element.required}
            className="w-full min-h-[80px]"
          />
        );

      case "date_of_birth":
      case "preferred_workout_time":
        return (
          <Input
            type="date"
            value={formData[element.id] || ""}
            onChange={(e) => handleInputChange(element.id, e.target.value)}
            required={element.required}
            className="w-full"
          />
        );

      case "current_fitness_level":
      case "dropdown":
        return (
          <Select
            value={formData[element.id] || ""}
            onValueChange={(value) => handleInputChange(element.id, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {element.dropdownOptions?.map((option, index) => (
                <SelectItem key={index} value={option || `option-${index}`}>
                  {option || `Option ${index + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {element.radioOptions?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`radio-${element.id}`}
                  value={option}
                  checked={formData[element.id] === option}
                  onChange={(e) =>
                    handleInputChange(element.id, e.target.value)
                  }
                  required={element.required}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        );

      case "checklist":
        return (
          <div className="space-y-2">
            {element.checklistOptions?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  checked={formData[element.id]?.includes?.(option) || false}
                  onCheckedChange={(checked) => {
                    const currentValues = formData[element.id] || [];
                    const newValues = checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleInputChange(element.id, newValues);
                  }}
                />
                <span className="text-sm text-gray-700">{option}</span>
              </div>
            ))}
          </div>
        );

      case "numeric":
        return (
          <Input
            type="number"
            placeholder={element.placeholder || "Enter number..."}
            value={formData[element.id] || ""}
            onChange={(e) => handleInputChange(element.id, e.target.value)}
            required={element.required}
            className="w-full"
          />
        );

      default:
        return <Input placeholder="Unknown field type" className="w-full" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Form not found
          </h2>
          <p className="text-gray-600">
            This signup form doesn't exist or is no longer active.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Thank you!
            </h2>
            <p className="text-gray-600 mb-4">
              Your signup form has been submitted successfully. We'll be in
              touch soon!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Simple Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mb-4">
          <img
            className="w-8 h-8"
            alt="PTFlow Logo"
            src="https://c.animaapp.com/mbqrzacsv2XpmH/img/frame-11.svg"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">PTFlow</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              {form.title}
            </CardTitle>
            <p className="text-gray-600 mb-4">{form.description}</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {form.elements
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((element) => (
                  <div key={element.id} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {element.label}
                      {element.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    {renderFormElement(element)}
                    {element.helpText && (
                      <p className="text-sm text-gray-500">
                        {element.helpText}
                      </p>
                    )}
                  </div>
                ))}

              {/* Pricing Plan Selection */}
              {form.pricing_plans && form.pricing_plans.filter(plan => plan.enabled).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Select Your Plan</h3>
                  <div className="grid gap-3">
                    {form.pricing_plans
                      .filter(plan => plan.enabled)
                      .map((plan, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedPlan?.name === plan.name
                              ? "border-green-600 bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedPlan(plan)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900">{plan.name}</h4>
                              <p className="text-sm text-gray-600">
                                {plan.price === 0 ? "Free" : `$${plan.price}/month`}
                              </p>
                            </div>
                            <div className="flex items-center">
                              {selectedPlan?.name === plan.name && (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={submitting || processingPayment}
              >
                {processingPayment ? (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Processing Payment...
                  </>
                ) : submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay & Submit Application
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
