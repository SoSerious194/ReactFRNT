"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FormService, FormWithElements } from "@/lib/formServices";
import FormBuilder from "@/components/FormBuilder";
import { useAuth } from "@/lib/useAuth";

export default function EditFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;
  const { user, loading: authLoading } = useAuth();

  const [form, setForm] = useState<FormWithElements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formService = new FormService();

  useEffect(() => {
    if (!authLoading && user) {
      loadForm();
    }
  }, [authLoading, user, formId]);

  const loadForm = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get coach ID from authenticated user
      if (!user) {
        setError("Please log in to edit forms.");
        return;
      }
      const coachId = user.id;
      const formData = await formService.getFormByCoachId(coachId);

      if (!formData || formData.id !== formId) {
        setError("Form not found");
        return;
      }

      setForm(formData);
    } catch (error) {
      console.error("Error loading form:", error);
      setError("Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForm = async (formData: {
    title: string;
    description: string;
    elements: any[];
  }) => {
    try {
      // Update form metadata
      await formService.updateForm(formId, {
        title: formData.title,
        description: formData.description,
      });

      // Delete existing elements
      if (form) {
        for (const element of form.form_elements) {
          await formService.deleteFormElement(element.id);
        }
      }

      // Add new elements
      for (const element of formData.elements) {
        console.log("Saving element with required field:", {
          label: element.label,
          required: element.required,
          requiredBoolean: Boolean(element.required),
        });

                 // Structure options based on element type
         let structuredOptions = null;
         if (element.type === "dropdown" && element.dropdownOptions) {
           structuredOptions = { options: element.dropdownOptions };
           console.log("Saving dropdown options:", element.dropdownOptions);
         } else if (element.type === "checklist" && element.checklistOptions) {
           structuredOptions = { options: element.checklistOptions };
           console.log("Saving checklist options:", element.checklistOptions);
         } else if (element.type === "radio" && element.radioOptions) {
           structuredOptions = { options: element.radioOptions };
           console.log("Saving radio options:", element.radioOptions);
         } else if (element.type === "range") {
           structuredOptions = {
             min: element.rangeMin,
             max: element.rangeMax,
             step: element.rangeStep,
           };
           console.log("Saving range options:", structuredOptions);
         }

        await formService.addFormElement({
          form_id: formId,
          element_type: element.type,
          label: element.label,
          placeholder: element.placeholder,
          required: Boolean(element.required),
          order_index: element.orderIndex,
          description: element.helpText || null,
          options: structuredOptions,
          validation_rules: element.validationRules,
          default_value: element.defaultValue,
          min_value: element.minValue,
          max_value: element.maxValue,
          min_length: element.minLength,
          max_length: element.maxLength,
          css_class: element.cssClass,
          help_text: element.helpText,
        });
      }

      router.push("/training-hub/forms");
    } catch (error) {
      console.error("Error saving form:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => router.push("/training-hub/forms")}
            className="text-blue-500 hover:text-blue-700"
          >
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-4">Form not found</div>
          <button
            onClick={() => router.push("/training-hub/forms")}
            className="text-blue-500 hover:text-blue-700"
          >
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  return (
    <FormBuilder
      initialForm={{
        id: form.id,
        title: form.title,
        description: form.description || "",
        elements: form.form_elements.map((element) => {
                    // Parse options based on element type
          let dropdownOptions, checklistOptions, radioOptions, rangeMin, rangeMax, rangeStep;
          
          console.log("Loading element options:", {
            type: element.element_type,
            options: element.options,
          });
          
          if (
            element.options &&
            typeof element.options === "object" &&
            !Array.isArray(element.options)
          ) {
            const options = element.options as Record<string, any>;
            if (element.element_type === "dropdown" && options.options) {
              dropdownOptions = options.options;
              console.log("Loaded dropdown options:", dropdownOptions);
            } else if (
              element.element_type === "checklist" &&
              options.options
            ) {
              checklistOptions = options.options;
              console.log("Loaded checklist options:", checklistOptions);
            } else if (element.element_type === "radio" && options.options) {
              radioOptions = options.options;
              console.log("Loaded radio options:", radioOptions);
            } else if (element.element_type === "range") {
              rangeMin = options.min;
              rangeMax = options.max;
              rangeStep = options.step;
              console.log("Loaded range options:", {
                rangeMin,
                rangeMax,
                rangeStep,
              });
            }
          }

                      return {
              id: element.id,
              type: element.element_type,
              label: element.label,
              placeholder: element.placeholder || "",
              required: element.required || false,
              orderIndex: element.order_index,
              options: element.options,
              validationRules: element.validation_rules,
              defaultValue: element.default_value || undefined,
              minValue: element.min_value || undefined,
              maxValue: element.max_value || undefined,
              minLength: element.min_length || undefined,
              maxLength: element.max_length || undefined,
              cssClass: element.css_class || undefined,
              helpText: element.help_text || undefined,
              dropdownOptions,
              checklistOptions,
              radioOptions,
              rangeMin,
              rangeMax,
              rangeStep,
            };
        }),
      }}
      onSave={handleSaveForm}
      mode="edit"
    />
  );
}
