import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });

      login(response.data.user, response.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="mb-8 text-2xl font-bold text-center text-gray-900">Welcome Back 👋</h2>

        {error && (
          <div className="p-3 mb-6 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            {/* Changed mb-1 to mb-3 for a larger gap between label and input */}
            <label className="block mb-3 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            {/* Changed mb-1 to mb-3 for a larger gap between label and input */}
            <label className="block mb-3 text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 pr-16 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-gray-600 hover:text-blue-600 focus:outline-none"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-3 mt-6 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-8 text-sm text-center text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/register")}
            className="font-medium text-blue-600 hover:underline"
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
