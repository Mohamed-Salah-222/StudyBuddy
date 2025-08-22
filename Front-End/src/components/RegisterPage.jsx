import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to register");

      navigate(`/verify-email?email=${email}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 -m-4 md:-m-8 p-6">
      <div className="w-full max-w-md">
        <form className="form bg-gray-300 border-2 border-gray-800 shadow-brutal p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-800 border-2 border-gray-800 shadow-brutal mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h1>
              <p className="text-gray-600 font-semibold">Join the collaborative workspace</p>
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-bold text-gray-800 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., mohamed_dev"
              className="w-full px-4 py-3 bg-white border-2 border-gray-800 shadow-brutal text-gray-800 placeholder-gray-600 font-semibold focus:outline-none transition-all duration-200"
              style={{
                boxShadow: "4px 4px #323232",
              }}
              onFocus={(e) => {
                e.target.style.transform = "translate(-2px, -2px)";
                e.target.style.boxShadow = "6px 6px #323232";
              }}
              onBlur={(e) => {
                e.target.style.transform = "translate(0, 0)";
                e.target.style.boxShadow = "4px 4px #323232";
              }}
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-gray-800 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-white border-2 border-gray-800 shadow-brutal text-gray-800 placeholder-gray-600 font-semibold focus:outline-none transition-all duration-200"
              style={{
                boxShadow: "4px 4px #323232",
              }}
              onFocus={(e) => {
                e.target.style.transform = "translate(-2px, -2px)";
                e.target.style.boxShadow = "6px 6px #323232";
              }}
              onBlur={(e) => {
                e.target.style.transform = "translate(0, 0)";
                e.target.style.boxShadow = "4px 4px #323232";
              }}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-gray-800 mb-2">
              Password
              <span className="text-xs font-normal text-gray-600 ml-2">(min. 8 characters)</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-white border-2 border-gray-800 shadow-brutal text-gray-800 placeholder-gray-600 font-semibold focus:outline-none transition-all duration-200"
              style={{
                boxShadow: "4px 4px #323232",
              }}
              onFocus={(e) => {
                e.target.style.transform = "translate(-2px, -2px)";
                e.target.style.boxShadow = "6px 6px #323232";
              }}
              onBlur={(e) => {
                e.target.style.transform = "translate(0, 0)";
                e.target.style.boxShadow = "4px 4px #323232";
              }}
            />
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-2">
              <div className="flex space-x-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-2 flex-1 border-2 border-gray-800 transition-all duration-300"
                    style={{
                      backgroundColor: password.length >= (i + 1) * 2 ? (i < 2 ? "#ef4444" : i < 3 ? "#f59e0b" : "#10b981") : "#d1d5db",
                      boxShadow: password.length >= (i + 1) * 2 ? "2px 2px #323232" : "none",
                    }}
                  />
                ))}
              </div>
              <p className="text-xs font-semibold text-gray-600">Password strength: {password.length < 4 ? "Weak" : password.length < 6 ? "Fair" : password.length < 8 ? "Good" : "Strong"}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 border-2 border-red-500 shadow-brutal">
              <p className="text-sm font-semibold text-red-700 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="oauthButton w-full px-4 py-3 bg-white border-2 border-gray-800 shadow-brutal font-semibold text-gray-800 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 relative overflow-hidden"
            style={{
              boxShadow: "4px 4px #323232",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "translate(-2px, -2px)";
                e.target.style.boxShadow = "6px 6px #323232";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "translate(0, 0)";
                e.target.style.boxShadow = "4px 4px #323232";
              }
            }}
            onMouseDown={(e) => {
              if (!loading) {
                e.target.style.transform = "translate(2px, 2px)";
                e.target.style.boxShadow = "2px 2px #323232";
              }
            }}
            onMouseUp={(e) => {
              if (!loading) {
                e.target.style.transform = "translate(-2px, -2px)";
                e.target.style.boxShadow = "6px 6px #323232";
              }
            }}
          >
            <span className="flex items-center justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Account
                </>
              )}
            </span>
          </button>

          {/* Login Link */}
          <div className="text-center border-t-2 border-gray-800 pt-6">
            <p className="text-sm font-semibold text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-gray-800 hover:underline transition-all duration-200" onMouseEnter={(e) => (e.target.style.textDecoration = "underline")} onMouseLeave={(e) => (e.target.style.textDecoration = "none")}>
                Log In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
