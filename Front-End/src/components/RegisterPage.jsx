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
    <div className="flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 -m-4 md:-m-8 relative overflow-hidden" style={{ minHeight: "calc(100vh - 120px)" }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-600/5 to-purple-600/5 rounded-full blur-2xl animate-ping" style={{ animationDuration: "5s" }} />
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 -z-5 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md bg-gray-800/40 backdrop-blur-2xl border border-gray-700/50 rounded-3xl shadow-2xl p-10 space-y-6 relative z-10 transition-all hover:shadow-purple-500/10 hover:shadow-2xl hover:border-gray-600/60 duration-500">
        {/* Glow Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600/5 to-blue-600/5 -z-10" />

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/25 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
            <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">Create Your Account</h1>
          <p className="text-gray-400 text-sm">Join the collaborative workspace</p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="group">
            <label htmlFor="username" className="block text-sm font-semibold text-gray-200 mb-2">
              Username
            </label>
            <div className="relative overflow-hidden rounded-xl">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., mohamed_dev"
                className="w-full px-4 py-3 rounded-xl border border-gray-600/50 bg-gray-800/50 backdrop-blur-sm text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 focus:outline-none transition-all duration-300 hover:bg-gray-700/50 hover:border-gray-500/60"
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-600 scale-x-0 group-focus-within:scale-x-100 transform transition-transform duration-300" />
            </div>
          </div>

          <div className="group">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-2">
              Email Address
            </label>
            <div className="relative overflow-hidden rounded-xl">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-600/50 bg-gray-800/50 backdrop-blur-sm text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 focus:outline-none transition-all duration-300 hover:bg-gray-700/50 hover:border-gray-500/60"
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-600 scale-x-0 group-focus-within:scale-x-100 transform transition-transform duration-300" />
            </div>
          </div>

          <div className="group">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-2">
              Password
              <span className="text-xs text-gray-400 ml-2 font-normal">(min. 8 characters)</span>
            </label>
            <div className="relative overflow-hidden rounded-xl">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-600/50 bg-gray-800/50 backdrop-blur-sm text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-purple-500/60 focus:border-purple-500/60 focus:outline-none transition-all duration-300 hover:bg-gray-700/50 hover:border-gray-500/60"
              />
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-600 scale-x-0 group-focus-within:scale-x-100 transform transition-transform duration-300" />
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password && (
            <div className="space-y-2">
              <div className="flex space-x-1">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${password.length >= (i + 1) * 2 ? (i < 2 ? "bg-red-500" : i < 3 ? "bg-yellow-500" : "bg-green-500") : "bg-gray-600"}`} />
                ))}
              </div>
              <p className="text-xs text-gray-400">Password strength: {password.length < 4 ? "Weak" : password.length < 6 ? "Fair" : password.length < 8 ? "Good" : "Strong"}</p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-gradient-to-r from-red-900/50 to-rose-900/50 border border-red-700/50 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-red-300 font-medium flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-lg relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="flex items-center justify-center relative z-10">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

          {/* Terms and Privacy */}
          <div className="text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 underline hover:no-underline transition-colors duration-200">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-purple-400 hover:text-purple-300 underline hover:no-underline transition-colors duration-200">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center border-t border-gray-700/50 pt-6">
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors duration-200 hover:underline cursor-pointer">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
