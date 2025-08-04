import { createClient } from "@/utils/supabase/client";
import { Database } from "@/types/database";

type Form = Database["public"]["Tables"]["forms"]["Row"];
type FormElement = Database["public"]["Tables"]["form_elements"]["Row"];
type FormResponse = Database["public"]["Tables"]["form_responses"]["Row"];

export interface FormWithElements extends Form {
  form_elements: FormElement[];
}

export interface FormResponseWithDetails extends FormResponse {
  form: FormWithElements;
  client: {
    full_name: string | null;
    email: string | null;
  };
}

export class FormService {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  // Get form by coach ID (since only one form per coach)
  async getFormByCoachId(coachId: string): Promise<FormWithElements | null> {
    console.log("Fetching form for coach ID:", coachId);

    const { data: form, error } = await this.supabase
      .from("forms")
      .select(
        `
        *,
        form_elements (
          *
        )
      `
      )
      .eq("coach_id", coachId)
      .single();

    if (error) {
      console.error("Error fetching form:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    console.log("Form found:", form);
    return form as FormWithElements;
  }

  // Create new form
  async createForm(
    coachId: string,
    title: string,
    description?: string
  ): Promise<Form | null> {
    console.log("Creating form with coach ID:", coachId);

    const { data: form, error } = await this.supabase
      .from("forms")
      .insert({
        coach_id: coachId,
        title,
        description,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating form:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    console.log("Form created successfully:", form);
    return form;
  }

  // Update form
  async updateForm(
    formId: string,
    updates: Partial<Form>
  ): Promise<Form | null> {
    const { data: form, error } = await this.supabase
      .from("forms")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formId)
      .select()
      .single();

    if (error) {
      console.error("Error updating form:", error);
      return null;
    }

    return form;
  }

  // Delete form and all its elements
  async deleteForm(formId: string): Promise<boolean> {
    try {
      // First, delete all form elements
      const { error: elementsError } = await this.supabase
        .from("form_elements")
        .delete()
        .eq("form_id", formId);

      if (elementsError) {
        console.error("Error deleting form elements:", elementsError);
        return false;
      }

      // Then, delete all form responses
      const { error: responsesError } = await this.supabase
        .from("form_responses")
        .delete()
        .eq("form_id", formId);

      if (responsesError) {
        console.error("Error deleting form responses:", responsesError);
        return false;
      }

      // Finally, delete the form itself
      const { error: formError } = await this.supabase
        .from("forms")
        .delete()
        .eq("id", formId);

      if (formError) {
        console.error("Error deleting form:", formError);
        return false;
      }

      console.log("Form and all related data deleted successfully");
      return true;
    } catch (error) {
      console.error("Error in deleteForm:", error);
      return false;
    }
  }

  // Add form element
  async addFormElement(
    element: Omit<FormElement, "id" | "created_at">
  ): Promise<FormElement | null> {
    console.log("Adding form element:", element);

    const { data: formElement, error } = await this.supabase
      .from("form_elements")
      .insert(element)
      .select()
      .single();

    if (error) {
      console.error("Error adding form element:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    console.log("Form element added successfully:", formElement);
    return formElement;
  }

  // Update form element
  async updateFormElement(
    elementId: string,
    updates: Partial<FormElement>
  ): Promise<FormElement | null> {
    const { data: formElement, error } = await this.supabase
      .from("form_elements")
      .update(updates)
      .eq("id", elementId)
      .select()
      .single();

    if (error) {
      console.error("Error updating form element:", error);
      return null;
    }

    return formElement;
  }

  // Delete form element
  async deleteFormElement(elementId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("form_elements")
      .delete()
      .eq("id", elementId);

    if (error) {
      console.error("Error deleting form element:", error);
      return false;
    }

    return true;
  }

  // Reorder form elements
  async reorderFormElements(
    formId: string,
    elementIds: string[]
  ): Promise<boolean> {
    const updates = elementIds.map((id, index) => ({
      id,
      order_index: index,
    }));

    const { error } = await this.supabase.from("form_elements").upsert(updates);

    if (error) {
      console.error("Error reordering form elements:", error);
      return false;
    }

    return true;
  }

  // Get form responses
  async getFormResponses(formId: string): Promise<FormResponseWithDetails[]> {
    const { data: responses, error } = await this.supabase
      .from("form_responses")
      .select(
        `
        *,
        form:forms(
          *,
          form_elements(*)
        ),
        client:users!form_responses_client_id_fkey(full_name, email)
      `
      )
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error fetching form responses:", error);
      return [];
    }

    return responses as FormResponseWithDetails[];
  }

  // Submit form response (for mobile app)
  async submitFormResponse(
    formId: string,
    clientId: string,
    responses: Record<string, any>
  ): Promise<boolean> {
    const { error } = await this.supabase.from("form_responses").upsert({
      form_id: formId,
      client_id: clientId,
      responses,
    });

    if (error) {
      console.error("Error submitting form response:", error);
      return false;
    }

    return true;
  }

  // Get form for mobile app (public endpoint)
  async getFormForMobile(formId: string): Promise<FormWithElements | null> {
    const { data: form, error } = await this.supabase
      .from("forms")
      .select(
        `
        *,
        form_elements (
          *
        )
      `
      )
      .eq("id", formId)
      .single();

    if (error) {
      console.error("Error fetching form for mobile:", error);
      return null;
    }

    return form as FormWithElements;
  }

  // Check if tables exist (for debugging)
  async checkTablesExist(): Promise<boolean> {
    try {
      // Try to select from forms table
      const { error: formsError } = await this.supabase
        .from("forms")
        .select("id")
        .limit(1);

      if (formsError) {
        console.error("Forms table error:", formsError);
        return false;
      }

      // Try to select from form_elements table
      const { error: elementsError } = await this.supabase
        .from("form_elements")
        .select("id")
        .limit(1);

      if (elementsError) {
        console.error("Form elements table error:", elementsError);
        return false;
      }

      console.log("All tables exist");
      return true;
    } catch (error) {
      console.error("Error checking tables:", error);
      return false;
    }
  }
}
