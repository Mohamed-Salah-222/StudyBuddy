import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset link.");
      }

      setMessage(data.message);
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
          <div className="w-16 h-16 rounded-md mx-auto mb-4 flex items-center justify-center border-2 border-gray-800 shadow-[4px_4px_0px_0px_#323232] bg-gray-800">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 font-mono">Forgot Your Password?</h1>
          <p className="text-base font-semibold text-gray-600 font-mono">No problem. Enter your email address below and we'll send you a link to reset it.</p>
        </div>

        {message && (
          <div className="p-3 border-2 border-green-600 rounded-md bg-white shadow-[2px_2px_0px_0px_#16a34a]">
            <p className="text-sm font-semibold flex items-center text-green-600 font-mono">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label htmlFor="email" className="block text-base font-bold mb-2 text-gray-800 font-mono">
              Email Address
            </label>
            <div className="relative">
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="w-full px-4 py-3 rounded-md border-2 border-gray-800 text-sm font-semibold text-gray-800 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-all duration-200 bg-white shadow-[4px_4px_0px_0px_#323232]" />
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

          <button type="submit" disabled={loading} className={`w-full px-4 py-3 font-semibold rounded-md focus:outline-none transition-all duration-200 border-2 shadow-[4px_4px_0px_0px_#323232] ${loading ? "bg-gray-400 text-gray-600 cursor-not-allowed border-gray-400 shadow-[4px_4px_0px_0px_#666]" : "bg-white text-gray-800 border-gray-800 hover:bg-gray-800 hover:text-white"}`}>
            <span className="flex items-center justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </span>
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 font-mono font-semibold">
          Remembered your password?{" "}
          <Link to="/login" className="font-bold text-gray-800 hover:text-blue-500 transition-colors duration-200 underline focus:outline-none">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
