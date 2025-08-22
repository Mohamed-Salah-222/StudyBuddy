import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function VerifyPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const userEmail = searchParams.get("email");
    if (userEmail) {
      setEmail(userEmail);
      setMessage(`A verification code has been sent to ${userEmail}.`);
    } else {
      setError("No email address provided. Please register again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, verificationCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Verification failed.");
      navigate("/login", { state: { message: "Account verified successfully! You can now log in." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("Sending a new code...");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ email, password: "dummyPassword", username: "dummyUser" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to resend code.");
      setMessage("A new verification code has been sent to your email.");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center bg-gray-100 -m-4 md:-m-8 relative" style={{ minHeight: "calc(100vh - 120px)" }}>
      <div className="w-full max-w-md bg-gray-300 border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_#323232] p-5 space-y-5 relative">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded bg-white border-2 border-gray-800 shadow-[4px_4px_0px_0px_#323232] mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="#323232" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: "var(--font-DelaGothicOne, DelaGothicOne, sans-serif)" }}>
            Verify Your Account
          </h1>
          <p className="text-base font-semibold text-gray-600" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
            Enter the verification code sent to your email
          </p>
        </div>

        {message && (
          <div className="p-3 border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_#323232] bg-white">
            <p className="text-sm font-semibold flex items-center justify-center text-gray-800" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
              <svg className="w-4 h-4 mr-2" fill="#323232" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="verificationCode" className="block text-base font-semibold mb-3 text-center text-gray-800" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
              Verification Code
            </label>
            <div className="relative">
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                maxLength="6"
                className="w-full px-4 py-4 text-2xl font-bold tracking-[0.5em] text-center rounded border-2 border-gray-800 shadow-[4px_4px_0px_0px_#323232] bg-white text-gray-800 outline-none focus:border-blue-600"
                style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}
                placeholder="123456"
              />
            </div>
            <p className="text-xs text-center mt-2 font-semibold text-gray-600" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
              Check your email for the 6-digit code
            </p>
          </div>

          {error && (
            <div className="p-3 border-2 border-gray-800 rounded shadow-[4px_4px_0px_0px_#323232] bg-white">
              <p className="text-sm font-semibold flex items-center justify-center text-gray-800" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
                <svg className="w-4 h-4 mr-2" fill="#323232" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

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
                  Verifying...
                </>
              ) : (
                "Verify Account"
              )}
            </span>
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm font-semibold text-gray-600" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
            Didn't receive the code?{" "}
            <button type="button" onClick={handleResend} className="font-bold text-gray-800 transition-all duration-200 hover:underline focus:outline-none border-b border-gray-800 hover:bg-gray-800 hover:text-white px-1" style={{ fontFamily: "var(--font-SpaceMono, SpaceMono, monospace)" }}>
              Resend Code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyPage;
