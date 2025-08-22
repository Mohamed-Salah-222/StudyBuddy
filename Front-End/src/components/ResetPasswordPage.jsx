import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ResetPasswordPage() {
  const { userId, token } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${userId}/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password.");
      }

      navigate("/login", { state: { message: data.message } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 -m-4 md:-m-8 relative" style={{ minHeight: "calc(100vh - 120px)" }}>
      <div className="w-full max-w-md bg-gray-300 border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_#323232] p-5 space-y-5 relative">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded bg-white border-2 border-gray-800 shadow-[4px_4px_0px_0px_#323232] mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="#323232" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "var(--font-DelaGothicOne, DelaGothicOne, sans-serif)" }}>
            Set a New Password
          </h1>
          <p className="text-base font-semibold text-gray-600" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
            Choose a strong password to protect your account
          </p>
        </div>

        {message && (
          <div className="p-3 border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_#323232] bg-white">
            <p className="text-sm text-center font-semibold flex items-center justify-center text-gray-800" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
              <svg className="w-4 h-4 mr-2" fill="#323232" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {message}
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_#323232] bg-white">
            <p className="text-sm text-center font-semibold flex items-center justify-center text-gray-800" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
              <svg className="w-4 h-4 mr-2" fill="#323232" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-base font-semibold mb-2 text-gray-800" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your new password"
              className="w-full h-10 px-2.5 rounded border-2 border-gray-800 shadow-[4px_4px_0px_0px_#323232] bg-white text-base font-semibold text-gray-800 outline-none focus:border-blue-600"
              style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-base font-semibold mb-2 text-gray-800" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm your new password"
              className="w-full h-10 px-2.5 rounded border-2 border-gray-800 shadow-[4px_4px_0px_0px_#323232] bg-white text-base font-semibold text-gray-800 outline-none focus:border-blue-600"
              style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 font-semibold rounded border-2 border-gray-800 shadow-[4px_4px_0px_0px_#323232] bg-white text-gray-800 text-base cursor-pointer transition-all duration-250 relative overflow-hidden z-10 hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-0 before:bg-gray-800 before:-z-10 before:transition-all before:duration-250 hover:before:w-full"
            style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}
          >
            <span className="flex items-center justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </span>
          </button>
        </form>

        <div className="p-4 border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_#323232] bg-white">
          <h3 className="text-base font-bold mb-2 text-gray-800" style={{ fontFamily: "var(--font-DelaGothicOne, DelaGothicOne, sans-serif)" }}>
            Password Requirements:
          </h3>
          <ul className="text-sm space-y-1 text-gray-600" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
            <li className="flex items-center font-semibold">
              <svg className="w-4 h-4 mr-2" fill="#323232" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              At least 8 characters long
            </li>
            <li className="flex items-center font-semibold">
              <svg className="w-4 h-4 mr-2" fill="#323232" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Include uppercase and lowercase letters
            </li>
            <li className="flex items-center font-semibold">
              <svg className="w-4 h-4 mr-2" fill="#323232" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Include at least one number
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
