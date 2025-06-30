"use client";

import LoginForm from "@/components/auth/LoginSection";
import SignupForm from "@/components/auth/SignUpSection";
import { useState } from "react";


export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Toggle Header */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${isLogin ? "bg-white text-green-600 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${!isLogin ? "bg-white text-green-600 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
            >
              Sign Up
            </button>
          </div>

          <h1 className="text-2xl font-bold text-center mb-6">{isLogin ? "Welcome Back" : "Create Account"}</h1>

          {/* Render appropriate form based on state */}
          {isLogin ? <LoginForm onToggle={() => setIsLogin(false)} /> : <SignupForm onToggle={() => setIsLogin(true)} />}
        </div>
      </div>
    </div>
  );
}




