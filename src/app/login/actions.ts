"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

type LoginState = {
  error?: string;
} | null;

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (!data.email || !data.password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.log("Login error:", error);

    if (error.message.includes("Invalid login credentials")) {
      return {
        error:
          "Invalid email or password. Please check your credentials and try again.",
      };
    } else if (error.message.includes("Email not confirmed")) {
      return {
        error:
          "Please check your email and click the confirmation link before logging in.",
      };
    } else if (error.message.includes("Too many requests")) {
      return {
        error:
          "Too many login attempts. Please wait a moment before trying again.",
      };
    } else {
      return { error: `Login failed: ${error.message}` };
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}

type SignupState = {
  error?: string;
  success?: string;
} | null;

export async function signup(
  prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (!data.email || !data.password) {
    return { error: "Email and password are required" };
  }

  if (data.password.length < 6) {
    return { error: "Password must be at least 6 characters long" };
  }

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.log("Signup error:", error);

    if (error.message.includes("User already registered")) {
      return {
        error:
          "An account with this email already exists. Please try logging in instead.",
      };
    } else if (error.message.includes("Password should be at least")) {
      return { error: "Password must be at least 6 characters long" };
    } else {
      return { error: `Signup failed: ${error.message}` };
    }
  }

  return {
    success:
      "Please check your email for confirmation link. You can log in after confirming your email.",
  };
}
