import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/images/logo.png";

export default function Forgot() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const submitEmail = async (e) => {
    e && e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email || !/\S+@\S+\.\S+/.test(email))
      return setError("Please enter a valid email");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });
      setMessage("Reset code sent to your email");
      setStep("code");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e) => {
    e && e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) return setError("Enter the 6-digit code");
    setLoading(true);
    try {
      await api.post("/auth/verify-reset", {
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
      setMessage("Code verified. You can now set a new password.");
      setStep("reset");
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (e) => {
    e && e.preventDefault();
    setError(null);
    if (password.length < 6)
      return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        password,
      });
      setMessage("Password updated. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex flex-col items-center mb-4">
          <img src={logo} alt="Quizly" className="h-12 mb-2" />
          <h2 className="text-lg font-semibold">Forgot password</h2>
        </div>

        {step === "email" && (
          <form onSubmit={submitEmail} className="space-y-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              type="email"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}
            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset code"}
            </button>
            <div className="text-center mt-3 text-sm">
              Back to{" "}
              <Link to="/login" className="text-black underline">
                Login
              </Link>
            </div>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={submitCode} className="space-y-4">
            <p className="text-sm">
              A 6-digit code was sent to <strong>{email}</strong>.
            </p>
            <input
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))
              }
              placeholder="Enter 6-digit code"
              inputMode="numeric"
              maxLength={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("email")}
                className="px-3 py-2 border rounded-md"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify code"}
              </button>
            </div>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={submitReset} className="space-y-4">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Retype new password"
              type="password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-green-600 text-sm">{message}</div>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("code")}
                className="px-3 py-2 border rounded-md"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
