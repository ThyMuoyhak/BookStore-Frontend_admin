import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";
import { toast } from "../utils/toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast("Please enter your email and password", "error");
      return;
    }
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      toast("Welcome back to the admin panel", "success");
      navigate(from, { replace: true });
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
            <span className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-amber-500 text-white text-3xl shadow-sm">
              🛠️
            </span>
            <h1 className="font-display text-2xl font-semibold text-stone-900 mt-4">
              BookStore Admin
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              Sign in to manage books and database.
            </p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bookstore.com"
                autoComplete="email"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-800"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-800"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-semibold shadow-sm"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-stone-400">
            Backend: <code className="text-amber-600">{API_BASE_URL}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
