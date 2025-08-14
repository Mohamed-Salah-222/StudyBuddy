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
    <div className="flex items-center justify-center bg-gradient-to-br from-green-50 via-stone-50 to-amber-50 -m-4 md:-m-8 relative overflow-hidden" style={{ minHeight: "calc(100vh - 120px)" }}>

      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-green-200/20 to-amber-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-stone-200/20 to-green-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-amber-200/10 to-green-200/10 rounded-full blur-2xl animate-ping" style={{ animationDuration: "5s" }} />
      </div>

      <div className="absolute inset-0 -z-5 opacity-10">
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(132, 169, 140, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(132, 169, 140, 0.1) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      </div>


      <div className="w-full max-w-md backdrop-blur-2xl border rounded-3xl shadow-2xl p-10 space-y-6 relative z-10 transition-all duration-500" style={{ backgroundColor: "rgba(254, 252, 247, 0.8)", borderColor: "rgba(132, 169, 140, 0.3)", boxShadow: "0 25px 50px -12px rgba(82, 121, 111, 0.15)" }}>

        <div className="absolute inset-0 rounded-3xl -z-10" style={{ background: "linear-gradient(135deg, rgba(132, 169, 140, 0.05), rgba(212, 165, 116, 0.05))" }} />


        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg relative overflow-hidden" style={{ background: "linear-gradient(135deg, #84a98c, #52796f)", boxShadow: "0 10px 25px -5px rgba(82, 121, 111, 0.3)" }}>
            <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent)" }} />
            <svg className="w-8 h-8 relative z-10" style={{ color: "#fefcf7" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold" style={{ background: "linear-gradient(135deg, #2d5016, #52796f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Create Your Account
          </h1>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Join the collaborative workspace
          </p>
        </div>

        <div className="space-y-5">
          <div className="group">
            <label htmlFor="username" className="block text-sm font-semibold mb-2" style={{ color: "#2d5016" }}>
              Username
            </label>
            <div className="relative overflow-hidden rounded-xl">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., mohamed_dev"
                className="w-full px-4 py-3 rounded-xl border backdrop-blur-sm text-sm font-medium placeholder-opacity-60 focus:ring-2 focus:outline-none transition-all duration-300"
                style={{
                  backgroundColor: "rgba(248, 246, 240, 0.7)",
                  borderColor: "rgba(132, 169, 140, 0.4)",
                  color: "#2d5016",
                  "--placeholder-color": "#6b7280",
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
            <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: "#2d5016" }}>
              Email Address
            </label>
            <div className="relative overflow-hidden rounded-xl">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border backdrop-blur-sm text-sm font-medium placeholder-opacity-60 focus:ring-2 focus:outline-none transition-all duration-300"
                style={{
                  backgroundColor: "rgba(248, 246, 240, 0.7)",
                  borderColor: "rgba(132, 169, 140, 0.4)",
                  color: "#2d5016",
                  "--placeholder-color": "#6b7280",
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
              <span className="text-xs font-normal ml-2" style={{ color: "#6b7280" }}>
                (min. 8 characters)
              </span>
            </label>
            <div className="relative overflow-hidden rounded-xl">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border backdrop-blur-sm text-sm font-medium placeholder-opacity-60 focus:ring-2 focus:outline-none transition-all duration-300"
                style={{
                  backgroundColor: "rgba(248, 246, 240, 0.7)",
                  borderColor: "rgba(132, 169, 140, 0.4)",
                  color: "#2d5016",
                  "--placeholder-color": "#6b7280",
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


          {password && (
            <div className="space-y-2">
              <div className="flex space-x-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: password.length >= (i + 1) * 2 ? (i < 2 ? "#ef4444" : i < 3 ? "#d4a574" : "#84a98c") : "rgba(107, 114, 128, 0.3)",
                    }}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: "#6b7280" }}>
                Password strength: {password.length < 4 ? "Weak" : password.length < 6 ? "Fair" : password.length < 8 ? "Good" : "Strong"}
              </p>
            </div>
          )}

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
            onClick={handleSubmit}
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
        </div>


        <div className="text-center border-t pt-6" style={{ borderColor: "rgba(132, 169, 140, 0.2)" }}>
          <p className="text-sm" style={{ color: "#6b7280" }}>
            Already have an account?{" "}
            <Link to="/login" className="font-semibold cursor-pointer hover:underline transition-colors duration-200" style={{ color: "#84a98c" }} onMouseEnter={(e) => (e.target.style.color = "#52796f")} onMouseLeave={(e) => (e.target.style.color = "#84a98c")}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
