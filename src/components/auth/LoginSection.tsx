"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { login } from "@/app/login/actions";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Zod schema for validation
const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm({ onToggle }: { onToggle: () => void }) {

    const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });



  const onSubmit = async (data: LoginFormData) => {
    try {
      // Create FormData object for server action
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await login(formData);
      if (result.success) {
        toast.success(result.message);
        router.push("/");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      // Handle error (you might want to set an error state here)
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        {/* Login Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-medium py-3 px-4 rounded-md transition-colors bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </div>
      </form>

      {/* Alternative Action */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button type="button" onClick={onToggle} className="font-medium hover:underline text-green-600">
            Sign up here
          </button>
        </p>
      </div>
    </>
  );
}
