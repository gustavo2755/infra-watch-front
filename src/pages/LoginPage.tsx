import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { Input } from "../components/ui/Input";
import { TOAST_MESSAGES } from "../constants/toastMessages";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/servers", { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success(TOAST_MESSAGES.LOGIN_SUCCESS);
      navigate("/servers", { replace: true });
    } catch {
      toast.error(TOAST_MESSAGES.LOGIN_ERROR);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-sky-500 to-sky-700">
      <div className="w-full max-w-md p-10 bg-white rounded-xl shadow-2xl">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border-b-2 border-gray-200 focus:border-sky-500 rounded-none border-t-0 border-x-0"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-b-2 border-gray-200 focus:border-sky-500 rounded-none border-t-0 border-x-0"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-sky-500 to-sky-700 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
