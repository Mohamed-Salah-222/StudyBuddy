// src/components/LoginPage.jsx (Corrected and Polished)
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // --- THIS IS THE CORRECTED LINE ---
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to log in");

      login(data.token);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-green-50 via-stone-50 to-amber-50 -m-4 md:-m-8 relative overflow-hidden" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-200/20 to-amber-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-amber-200/20 to-green-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-stone-200/10 to-green-200/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: "4s" }} />
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 -z-5 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(132, 169, 140, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(132, 169, 140, 0.1) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md backdrop-blur-2xl border rounded-3xl shadow-2xl p-10 space-y-6 relative z-10 transition-all duration-500" style={{ backgroundColor: "rgba(254, 252, 247, 0.8)", borderColor: "rgba(132, 169, 140, 0.3)", boxShadow: "0 25px 50px -12px rgba(82, 121, 111, 0.15)" }}>
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-3xl -z-10" style={{ background: "linear-gradient(135deg, rgba(132, 169, 140, 0.05), rgba(212, 165, 116, 0.05))" }} />

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg relative overflow-hidden" style={{ background: "linear-gradient(135deg, #84a98c, #52796f)", boxShadow: "0 10px 25px -5px rgba(82, 121, 111, 0.3)" }}>
            <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent)" }} />
            <svg className="w-8 h-8 relative z-10" style={{ color: "#fefcf7" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ background: "linear-gradient(135deg, #2d5016, #52796f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Welcome Back!
          </h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Continue your collaborative journey
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 border rounded-xl backdrop-blur-sm" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.3)" }}>
            <p className="text-sm font-medium flex items-center" style={{ color: "#16a34a" }}>
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </p>
          </div>
        )}

        {/* Google Sign In */}
        <a
          href={`${import.meta.env.VITE_API_URL}/api/auth/google`}
          className="w-full flex items-center justify-center px-4 py-3 border rounded-xl shadow-sm text-sm font-medium transition-all duration-300 hover:shadow-lg group"
          style={{ backgroundColor: "rgba(248, 246, 240, 0.7)", borderColor: "rgba(132, 169, 140, 0.4)", color: "#2d5016" }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "rgba(248, 246, 240, 0.9)";
            e.target.style.borderColor = "rgba(132, 169, 140, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "rgba(248, 246, 240, 0.7)";
            e.target.style.borderColor = "rgba(132, 169, 140, 0.4)";
          }}
        >
          <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M43.611 20.083H24v8.53h11.303c-1.649 4.657-6.08 8.12-11.303 8.12-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l6.464-6.464C34.643 4.125 29.643 2 24 2 11.852 2 2 11.852 2 24s9.852 22 22 22c11.996 0 21.227-8.388 21.227-21.227 0-1.319-.122-2.61-.355-3.868z"></path>
            <path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"></path>
            <path fill="#FBBC04" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
            <path fill="#EA4335" d="M43.611 20.083L43.595 20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
          </svg>
          <span className="transition-colors duration-200" style={{ color: "#2d5016" }}>
            Sign in with Google
          </span>
        </a>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "rgba(132, 169, 140, 0.3)" }}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 backdrop-blur-sm" style={{ backgroundColor: "rgba(254, 252, 247, 0.8)", color: "#6b7280" }}>
              Or continue with email
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: "#2d5016" }}>
              Email Address
            </label>
            <div className="relative overflow-hidden rounded-xl">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border backdrop-blur-sm text-sm font-medium placeholder-opacity-60 focus:ring-2 focus:outline-none transition-all duration-300"
                style={{
                  backgroundColor: "rgba(248, 246, 240, 0.7)",
                  borderColor: "rgba(132, 169, 140, 0.4)",
                  color: "#2d5016",
                  placeholderColor: "#6b7280",
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = "rgba(248, 246, 240, 0.9)";
                  e.target.style.borderColor = "rgba(132, 169, 140, 0.6)";
                  e.target.style.boxShadow = "0 0 0 2px rgba(132, 169, 140, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = "rgba(248, 246, 240, 0.7)";
                  e.target.style.borderColor = "rgba(132, 169, 140, 0.4)";
                  e.target.style.boxShadow = "none";
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 0.8)";
                    e.target.style.borderColor = "rgba(132, 169, 140, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 0.7)";
                    e.target.style.borderColor = "rgba(132, 169, 140, 0.4)";
                  }
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 group-focus-within:scale-x-100 transform transition-transform duration-300" style={{ background: "linear-gradient(90deg, #84a98c, #d4a574)" }} />
            </div>
          </div>

          <div className="group">
            <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: "#2d5016" }}>
              Password
            </label>
            <div className="relative overflow-hidden rounded-xl">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border backdrop-blur-sm text-sm font-medium placeholder-opacity-60 focus:ring-2 focus:outline-none transition-all duration-300"
                style={{
                  backgroundColor: "rgba(248, 246, 240, 0.7)",
                  borderColor: "rgba(132, 169, 140, 0.4)",
                  color: "#2d5016",
                  placeholderColor: "#6b7280",
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = "rgba(248, 246, 240, 0.9)";
                  e.target.style.borderColor = "rgba(132, 169, 140, 0.6)";
                  e.target.style.boxShadow = "0 0 0 2px rgba(132, 169, 140, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = "rgba(248, 246, 240, 0.7)";
                  e.target.style.borderColor = "rgba(132, 169, 140, 0.4)";
                  e.target.style.boxShadow = "none";
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 0.8)";
                    e.target.style.borderColor = "rgba(132, 169, 140, 0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 0.7)";
                    e.target.style.borderColor = "rgba(132, 169, 140, 0.4)";
                  }
                }}
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 group-focus-within:scale-x-100 transform transition-transform duration-300" style={{ background: "linear-gradient(90deg, #84a98c, #d4a574)" }} />
            </div>
            <div className="text-right mt-2">
              <Link to="/forgot-password" className="text-xs font-medium hover:underline transition-colors duration-200" style={{ color: "#84a98c" }} onMouseEnter={(e) => (e.target.style.color = "#52796f")} onMouseLeave={(e) => (e.target.style.color = "#84a98c")}>
                Forgot Password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-4 border rounded-xl backdrop-blur-sm" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.3)" }}>
              <p className="text-sm font-medium flex items-center" style={{ color: "#dc2626" }}>
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-semibold rounded-xl shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 relative overflow-hidden group"
            style={{
              background: "linear-gradient(135deg, #84a98c, #52796f)",
              color: "#fefcf7",
              boxShadow: "0 10px 25px -5px rgba(82, 121, 111, 0.3)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.background = "linear-gradient(135deg, #52796f, #84a98c)";
                e.target.style.boxShadow = "0 20px 40px -10px rgba(82, 121, 111, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.background = "linear-gradient(135deg, #84a98c, #52796f)";
                e.target.style.boxShadow = "0 10px 25px -5px rgba(82, 121, 111, 0.3)";
              }
            }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, #d4a574, #84a98c)" }} />
            <span className="flex items-center justify-center relative z-10">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" style={{ color: "#fefcf7" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging In...
                </>
              ) : (
                "Log In"
              )}
            </span>
          </button>
        </form>

        <p className="text-sm text-center" style={{ color: "#6b7280" }}>
          Need an account?{" "}
          <Link to="/register" className="font-semibold transition-colors duration-200 hover:underline ml-1" style={{ color: "#84a98c" }} onMouseEnter={(e) => (e.target.style.color = "#52796f")} onMouseLeave={(e) => (e.target.style.color = "#84a98c")}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
