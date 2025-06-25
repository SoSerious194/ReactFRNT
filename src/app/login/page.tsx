"use client";

import { USER_ROLES } from "@/lib/constant";
import { login, signup } from "./actions";
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

          <form className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            {/* Confirm Password Field - Only for Signup */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {/* User Role Field */}
            {!isLogin && (
              <div>
                <label htmlFor="user_role" className="block text-sm font-medium text-gray-700 mb-1">
                  User Role
                </label>
                <select id="user_role" name="user_role" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value={USER_ROLES.CLIENT}>Client</option>
                  <option value={USER_ROLES.COACH}>Coach</option>
                </select>
              </div>
            )}

            {/* Action Button */}
            <div className="pt-4">
              <button formAction={isLogin ? login : signup} className={`w-full font-medium py-3 px-4 rounded-md transition-colors bg-green-600 hover:bg-green-700 text-white`}>
                {isLogin ? "Log In" : "Sign Up"}
              </button>
            </div>
          </form>

          {/* Alternative Action */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className={`font-medium hover:underline text-green-600`}>
                {isLogin ? "Sign up here" : "Log in here"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
