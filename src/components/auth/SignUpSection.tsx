"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { USER_ROLES } from "@/lib/constant";
import { signup } from "@/app/login/actions";
import { toast } from "react-hot-toast";

// Zod schema for validation
const signupSchema = z
  .object({
    full_name: z.string().min(1, "Full name is required").min(2, "Full name must be at least 2 characters long").max(50, "Full name must be less than 50 characters"),
    email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    user_role: z.string().min(1, "Please select a user role"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupForm({ onToggle }: { onToggle: () => void }) {
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      user_role: USER_ROLES.CLIENT, // Set default role
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      // Create FormData object for server action
      const formData = new FormData();
      formData.append("full_name", data.full_name);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("confirmPassword", data.confirmPassword);
      formData.append("user_role", data.user_role);

      const result = await signup(formData);
      if (result.success) {
        toast.success(result.message);
        setUserEmail(data.email);
        setIsSignupSuccess(true);
      } else {
        toast.error(result.message);
      }

    } catch (error) {
      console.error("Signup error:", error);
      // Handle error (you might want to set an error state here)
    }
  };

  // Show success message after signup
  if (isSignupSuccess) {
    return (
      <div className="text-center space-y-6">
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Success Message */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-900">Account Created Successfully!</h3>
          <p className="text-gray-600">We've sent a verification email to:</p>
          <p className="font-medium text-gray-900 bg-gray-50 px-3 py-2 rounded-md">{userEmail}</p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">Next Steps:</h4>
              <div className="mt-2 text-sm text-blue-800">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the magic link in the verification email</li>
                  <li>You'll be automatically logged in</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-gray-500 space-y-2">
          <p>Didn't receive the email? Check your spam folder or</p>
          <button onClick={() => setIsSignupSuccess(false)} className="text-green-600 hover:text-green-700 font-medium hover:underline">
            try signing up again
          </button>
        </div>

        {/* Back to Login */}
        <div className="pt-4 border-t border-gray-200">
          <button type="button" onClick={onToggle} className="text-green-600 hover:text-green-700 font-medium hover:underline">
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Full Name Field */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="full_name"
            type="text"
            {...register("full_name")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.full_name ? "border-red-500" : "border-gray-300"}`}
            placeholder="Enter your full name"
          />
          {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? "border-red-500" : "border-gray-300"}`}
            placeholder="Enter your email"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? "border-red-500" : "border-gray-300"}`}
            placeholder="Enter your password"
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        {/* User Role Field */}
        <div>
          <label htmlFor="user_role" className="block text-sm font-medium text-gray-700 mb-1">
            User Role
          </label>
          <select
            id="user_role"
            {...register("user_role")}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.user_role ? "border-red-500" : "border-gray-300"}`}
          >
            <option value={USER_ROLES.CLIENT}>Client</option>
            <option value={USER_ROLES.COACH}>Coach</option>
          </select>
          {errors.user_role && <p className="mt-1 text-sm text-red-600">{errors.user_role.message}</p>}
        </div>

        {/* Signup Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-medium py-3 px-4 rounded-md transition-colors bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white"
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </div>
      </form>

      {/* Alternative Action */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button type="button" onClick={onToggle} className="font-medium hover:underline text-green-600">
            Log in here
          </button>
        </p>
      </div>
    </>
  );
}
