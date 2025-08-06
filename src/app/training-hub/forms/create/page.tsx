"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormService } from "@/lib/formServices";
import FormBuilder from "@/components/FormBuilder";
import { useAuth } from "@/lib/useAuth";

export default function CreateFormPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { user, loading } = useAuth();

  const formService = new FormService();

  const handleSaveForm = async (formData: {
    title: string;
    description: string;
    elements: any[];
  }) => {
    setSaving(true);
    try {
      // Check if tables exist first
      const tablesExist = await formService.checkTablesExist();
      if (!tablesExist) {
        alert("Database tables don't exist. Please run the SQL schema first.");
        return;
      }

      // Get coach ID from authenticated user
      if (!user) {
        alert("Please log in to create a form.");
        return;
      }
      const coachId = user.id;

      // Create the form
      const form = await formService.createForm(
        coachId,
        formData.title,
        formData.description
      );

      if (!form) {
        throw new Error("Failed to create form");
      }

      // Add form elements
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
          form_id: form.id,
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
      console.error("Error creating form:", error);
      alert("Error creating form. Please check the console for details.");
    } finally {
      setSaving(false);
    }
  };

  return <FormBuilder onSave={handleSaveForm} mode="create" />;
}
