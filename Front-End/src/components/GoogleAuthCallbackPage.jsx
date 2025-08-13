import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function GoogleAuthCallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      console.log("Token found, logging in and redirecting...");
      login(token);
      navigate("/", { replace: true });
    } else {
      console.error("No token found in URL, redirecting to login.");
      navigate("/login", { replace: true });
    }
  }, []);
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg font-semibold">Finalizing your login...</p>
      </div>
    </div>
  );
}

export default GoogleAuthCallbackPage;
