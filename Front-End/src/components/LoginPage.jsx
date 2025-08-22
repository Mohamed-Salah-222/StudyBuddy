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
    <div className="flex items-center justify-center bg-gray-100 -m-4 md:-m-8 relative overflow-hidden" style={{ minHeight: "calc(100vh - 120px)" }}>
      <div className="w-full max-w-md bg-gray-300 border-2 border-gray-800 rounded-md shadow-[4px_4px_0px_0px_#323232] p-5 space-y-5 relative z-10">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-md mx-auto flex items-center justify-center border-2 border-gray-800 shadow-[4px_4px_0px_0px_#323232] bg-gray-800">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 font-mono">Welcome Back!</h1>
          <p className="text-base font-semibold text-gray-600 font-mono">Continue your collaborative journey</p>
        </div>

        {successMessage && (
          <div className="p-3 border-2 border-green-600 rounded-md bg-white shadow-[2px_2px_0px_0px_#16a34a]">
            <p className="text-sm font-semibold flex items-center text-green-600 font-mono">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </p>
          </div>
        )}

        <a href={`${import.meta.env.VITE_API_URL}/api/auth/google`} className="w-full flex items-center justify-center px-4 py-2 border-2 border-gray-800 rounded-md shadow-[4px_4px_0px_0px_#323232] text-sm font-semibold transition-all duration-200 bg-white text-gray-800 hover:bg-gray-800 hover:text-white h-10">
          <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M43.611 20.083H24v8.53h11.303c-1.649 4.657-6.08 8.12-11.303 8.12-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l6.464-6.464C34.643 4.125 29.643 2 24 2 11.852 2 2 11.852 2 24s9.852 22 22 22c11.996 0 21.227-8.388 21.227-21.227 0-1.319-.122-2.61-.355-3.868z"></path>
            <path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"></path>
            <path fill="#FBBC04" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
            <path fill="#EA4335" d="M43.611 20.083L43.595 20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
          </svg>
          <span>Sign in with Google</span>
        </a>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-1 bg-gray-600 rounded-md"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-gray-300 text-gray-800 font-mono font-semibold">OR</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label htmlFor="email" className="block text-base font-bold mb-2 text-gray-800 font-mono">
              Email Address
            </label>
            <div className="relative">
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 rounded-md border-2 border-gray-800 text-sm font-semibold text-gray-800 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all duration-200 bg-white shadow-[4px_4px_0px_0px_#323232]" />
            </div>
          </div>

          <div className="group">
            <label htmlFor="password" className="block text-base font-bold mb-2 text-gray-800 font-mono">
              Password
            </label>
            <div className="relative">
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-md border-2 border-gray-800 text-sm font-semibold text-gray-800 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all duration-200 bg-white shadow-[4px_4px_0px_0px_#323232]" />
            </div>
            <div className="text-right mt-2">
              <Link to="/forgot-password" className="text-xs font-bold text-gray-800 hover:text-blue-500 transition-colors duration-200 underline font-mono">
                Forgot Password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-3 border-2 border-red-600 rounded-md bg-white shadow-[2px_2px_0px_0px_#dc2626]">
              <p className="text-sm font-semibold flex items-center text-red-600 font-mono">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className={`w-full px-4 py-2 font-semibold rounded-md transition-all duration-200 border-2 shadow-[4px_4px_0px_0px_#323232] h-10 ${loading ? "bg-gray-400 text-gray-600 cursor-not-allowed border-gray-400 shadow-[4px_4px_0px_0px_#666]" : "bg-white text-gray-800 border-gray-800 hover:bg-gray-800 hover:text-white"}`}>
            <span className="flex items-center justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging In...
                </>
              ) : (
                <>
                  Log In
                  <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 17 5-5-5-5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m13 17 5-5-5-5" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 font-mono font-semibold">
          Need an account?{" "}
          <Link to="/register" className="font-bold text-gray-800 hover:text-blue-500 transition-colors duration-200 underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
