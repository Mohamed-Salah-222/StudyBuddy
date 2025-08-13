// src/components/VerifyPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function VerifyPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false); // To disable button while resending

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

  // --- NEW FUNCTION FOR RESENDING THE CODE ---
  const handleResend = async () => {
    setError("");
    setMessage("Sending a new code...");
    try {
      // We call the register endpoint again. The backend logic will find the
      // unverified user and send them a new code.
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // We need to send a dummy password/username as they are required by the backend
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
    <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50 -m-4 md:-m-8 relative overflow-hidden" style={{ minHeight: "calc(100vh - 120px)", backgroundColor: "#fefcf7" }}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, rgba(132, 169, 140, 0.15) 0%, rgba(82, 121, 111, 0.1) 100%)" }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl animate-pulse delay-1000" style={{ background: "radial-gradient(circle, rgba(212, 165, 116, 0.15) 0%, rgba(132, 169, 140, 0.1) 100%)" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-500" style={{ background: "radial-gradient(circle, rgba(82, 121, 111, 0.08) 0%, rgba(212, 165, 116, 0.08) 100%)" }}></div>
      </div>

      <div
        className="w-full max-w-md backdrop-blur-xl border rounded-3xl shadow-2xl p-8 space-y-6 relative z-10 transition-all duration-300"
        style={{
          backgroundColor: "rgba(248, 246, 240, 0.95)",
          borderColor: "rgba(132, 169, 140, 0.3)",
          boxShadow: "0 25px 50px -12px rgba(45, 80, 22, 0.15), 0 0 0 1px rgba(132, 169, 140, 0.1)",
        }}
      >
        <div className="text-center space-y-2">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg"
            style={{
              background: "linear-gradient(135deg, #84a98c 0%, #52796f 100%)",
              boxShadow: "0 10px 25px -5px rgba(82, 121, 111, 0.4)",
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke="#fefcf7" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1
            className="text-3xl font-bold"
            style={{
              background: "linear-gradient(135deg, #2d5016 0%, #52796f 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Verify Your Account
          </h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Enter the verification code sent to your email
          </p>
        </div>

        {message && (
          <div
            className="p-3 border rounded-xl backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(132, 169, 140, 0.1)",
              borderColor: "rgba(132, 169, 140, 0.3)",
            }}
          >
            <p className="text-sm font-medium flex items-center justify-center" style={{ color: "#2d5016" }}>
              <svg className="w-4 h-4 mr-2" fill="#52796f" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="group">
            <label htmlFor="verificationCode" className="block text-sm font-semibold mb-3 text-center" style={{ color: "#2d5016" }}>
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
                className="w-full px-4 py-4 text-2xl font-bold tracking-[0.5em] text-center rounded-xl border-2 focus:outline-none focus:ring-2 transition-all duration-200 backdrop-blur-sm"
                style={{
                  borderColor: "#84a98c",
                  backgroundColor: "rgba(248, 246, 240, 0.8)",
                  color: "#2d5016",
                  "--placeholder-color": "#6b7280",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#52796f";
                  e.target.style.boxShadow = "0 0 0 3px rgba(132, 169, 140, 0.2)";
                  e.target.style.backgroundColor = "rgba(248, 246, 240, 1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#84a98c";
                  e.target.style.boxShadow = "none";
                  e.target.style.backgroundColor = "rgba(248, 246, 240, 0.8)";
                }}
                onMouseEnter={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 0.9)";
                    e.target.style.borderColor = "#52796f";
                  }
                }}
                onMouseLeave={(e) => {
                  if (document.activeElement !== e.target) {
                    e.target.style.backgroundColor = "rgba(248, 246, 240, 0.8)";
                    e.target.style.borderColor = "#84a98c";
                  }
                }}
                placeholder="123456"
              />
              <div
                className="absolute inset-x-0 bottom-0 h-0.5 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 rounded-full mx-4"
                style={{
                  background: "linear-gradient(90deg, #84a98c 0%, #d4a574 100%)",
                }}
              ></div>
            </div>
            <p className="text-xs text-center mt-2" style={{ color: "#6b7280" }}>
              Check your email for the 6-digit code
            </p>
          </div>

          {error && (
            <div
              className="p-3 border rounded-xl backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                borderColor: "rgba(220, 38, 38, 0.3)",
              }}
            >
              <p className="text-sm font-medium flex items-center justify-center" style={{ color: "#b91c1c" }}>
                <svg className="w-4 h-4 mr-2" fill="#dc2626" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #84a98c 0%, #52796f 100%)",
              color: "#fefcf7",
              boxShadow: "0 10px 25px -5px rgba(82, 121, 111, 0.4)",
              focusRingColor: "#84a98c",
              focusRingOffsetColor: "#f8f6f0",
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.background = "linear-gradient(135deg, #52796f 0%, #2d5016 100%)";
                e.target.style.boxShadow = "0 15px 35px -5px rgba(82, 121, 111, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.background = "linear-gradient(135deg, #84a98c 0%, #52796f 100%)";
                e.target.style.boxShadow = "0 10px 25px -5px rgba(82, 121, 111, 0.4)";
              }
            }}
          >
            <span className="flex items-center justify-center">
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" style={{ color: "#fefcf7" }}>
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
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Didn't receive the code?{" "}
            <button type="button" onClick={handleResend} className="font-semibold transition-colors duration-200 hover:underline focus:outline-none" style={{ color: "#d4a574" }} onMouseEnter={(e) => (e.target.style.color = "#84a98c")} onMouseLeave={(e) => (e.target.style.color = "#d4a574")} onFocus={(e) => (e.target.style.color = "#84a98c")} onBlur={(e) => (e.target.style.color = "#d4a574")}>
              Resend Code
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyPage;
