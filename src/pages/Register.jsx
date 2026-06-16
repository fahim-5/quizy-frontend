import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/images/logo.png";
import useAuth from "../hooks/useAuth";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    id: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    institution: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifyModal, setVerifyModal] = useState({
    show: false,
    email: "",
    code: "",
    loading: false,
    error: null,
    resent: false,
    success: false,
  });
  const [registered, setRegistered] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (registered) {
      // If already registered, ensure modal is visible and do not re-submit
      setVerifyModal((v) => ({ ...v, show: true }));
      return;
    }
    setError(null);
    const requiredFields = [
      "name",
      "id",
      "email",
      "password",
      "confirmPassword",
      "institution",
      "role",
    ];
    const missing = requiredFields.filter(
      (k) => !(form[k] && form[k].toString().trim()),
    );
    if (missing.length) return setError("Please fill in all required fields");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");
    if ((form.password || "").length < 6)
      return setError("Password must be at least 6 characters long");
    // Immediately show verification modal so user is prompted regardless of network
    setVerifyModal((v) => ({
      ...v,
      show: true,
      email: form.email.trim().toLowerCase(),
      code: "",
      error: null,
      resent: false,
    }));
    setLoading(true);
    setRegistered(false);

    try {
      const res = await api.post("/auth/register", {
        name: form.name.trim(),
        id: form.id.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
        institution: form.institution.trim(),
      });
      // server accepted registration, mark as registered (awaiting code)
      setRegistered(true);
      setError(null);
      const preview = res?.data?.data?.preview;
      if (preview) {
        setVerifyModal((v) => ({ ...v, preview }));
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Registration failed";
      // show error inside modal if it's visible, otherwise global error
      setVerifyModal((v) => ({ ...v, error: msg }));
      setError(msg);
      // if registration failed, allow editing again
      setRegistered(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-black">
            Register Account to
          </h2>
          <img src={logo} alt="Quizly" className="h-12" />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm  text-gray-700 font-medium">Name</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              disabled={registered}
              placeholder="Full name"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700 font-medium">
              Institution
            </span>
            <input
              name="institution"
              value={form.institution}
              onChange={handleChange}
              disabled={registered}
              placeholder="Institution name"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700 font-medium">Email</span>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={registered}
              placeholder="you@example.com"
              type="email"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700 font-medium">ID</span>
            <input
              name="id"
              value={form.id}
              onChange={handleChange}
              disabled={registered}
              placeholder="Enter your ID"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-700 font-medium">Password</span>
            <div className="relative mt-1">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                disabled={registered}
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
                required
                className="block w-full border border-gray-300 rounded-md px-3 pr-10 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button
                type="button"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-700 hover:opacity-80"
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.96 9.96 0 014.125.875"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <label className="block">
            <span className="text-sm text-gray-700 font-medium">
              Retype Password
            </span>
            <div className="relative mt-1">
              <input
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={registered}
                placeholder="Retype password"
                type={showConfirmPassword ? "text" : "password"}
                required
                className="block w-full border border-gray-300 rounded-md px-3 pr-10 py-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button
                type="button"
                aria-pressed={showConfirmPassword}
                onClick={() => setShowConfirmPassword((s) => !s)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                title={showConfirmPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-700 hover:opacity-80"
              >
                {showConfirmPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a9.96 9.96 0 014.125.875"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </label>

          <fieldset className="flex gap-6 items-center justify-center">
            <legend className="sr-only">Role</legend>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="student"
                checked={form.role === "student"}
                onChange={handleChange}
                required
                className="accent-black focus:ring-black"
                disabled={registered}
              />
              <span className="text-sm text-black">Student</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="role"
                value="teacher"
                checked={form.role === "teacher"}
                onChange={handleChange}
                className="accent-black focus:ring-black"
                disabled={registered}
              />
              <span className="text-sm text-black">Teacher</span>
            </label>
          </fieldset>

          {error && <div className="text-red-600 text-sm">{error}</div>}
          {registered && (
            <div className="text-green-600 text-sm">
              Verification code sent to {verifyModal.email}. Please check your
              email.
            </div>
          )}
          <button
            type="submit"
            disabled={loading || registered}
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading
              ? "Registering..."
              : registered
                ? "Awaiting verification"
                : "Register"}
          </button>

          <div className="text-center mt-3 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-black font-medium underline">
              Login
            </a>
          </div>
        </form>
      </div>
      {verifyModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">
              Check your email and verify the code
            </h3>
            <p className="text-sm mb-2">
              A 6-digit verification code was sent to{" "}
              <strong>{verifyModal.email}</strong>. Please check your email and
              enter the code below to complete registration.
            </p>
            {verifyModal.error && (
              <div className="text-red-600 mb-2">{verifyModal.error}</div>
            )}
            <div className="mb-3">
              <label className="block text-sm text-gray-700">
                Check your email and enter the 6-digit verification code
              </label>
              <input
                className="w-full border px-2 py-1 rounded-md"
                value={verifyModal.code}
                onChange={(e) => {
                  const digits = e.target.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 6);
                  setVerifyModal((v) => ({ ...v, code: digits }));
                }}
                inputMode="numeric"
                maxLength={6}
                autoFocus
              />
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Didn't receive?{" "}
                <button
                  onClick={async () => {
                    setVerifyModal((v) => ({
                      ...v,
                      loading: true,
                      error: null,
                    }));
                    try {
                      const r = await api.post("/auth/resend-verification", {
                        email: verifyModal.email,
                      });
                      const preview = r?.data?.data?.preview;
                      setVerifyModal((v) => ({
                        ...v,
                        loading: false,
                        resent: true,
                        preview: preview || v.preview,
                      }));
                    } catch (err) {
                      setVerifyModal((v) => ({
                        ...v,
                        loading: false,
                        error:
                          err?.response?.data?.message ||
                          err.message ||
                          "Resend failed",
                      }));
                    }
                  }}
                  className="text-black underline"
                >
                  Resend
                </button>
              </div>
              {verifyModal.preview && (
                <div className="mt-2 text-sm">
                  <a
                    href={verifyModal.preview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Open email preview
                  </a>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setVerifyModal((v) => ({ ...v, show: false, error: null }));
                    setRegistered(false);
                  }}
                  className="px-3 py-1 border rounded-md"
                  disabled={verifyModal.loading}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setVerifyModal((v) => ({
                      ...v,
                      loading: true,
                      error: null,
                    }));
                    try {
                      if (!/^[0-9]{6}$/.test(verifyModal.code)) {
                        throw new Error("Please enter the 6-digit code");
                      }
                      const res = await api.post("/auth/verify-email", {
                        email: verifyModal.email,
                        code: verifyModal.code.trim(),
                      });
                      const token = res.data.token;
                      const user = res.data.data.user;
                      auth && auth.login && auth.login(user, token);
                      setVerifyModal((v) => ({
                        ...v,
                        loading: false,
                        show: false,
                      }));
                      navigate(
                        user && user.role === "teacher"
                          ? "/dashboard/teacher"
                          : "/dashboard/student",
                      );
                    } catch (err) {
                      setVerifyModal((v) => ({
                        ...v,
                        loading: false,
                        error:
                          err?.response?.data?.message ||
                          err.message ||
                          "Verification failed",
                      }));
                    }
                  }}
                  className="px-3 py-1 bg-black text-white rounded-md"
                  disabled={verifyModal.loading}
                >
                  {verifyModal.loading
                    ? "Verifying..."
                    : "Complete Registration"}
                </button>
              </div>
            </div>
            {verifyModal.resent && (
              <div className="text-sm text-green-600 mt-2">Code resent</div>
            )}
            {verifyModal.success && (
              <div className="text-sm text-green-600 mt-2">
                Verification successful — redirecting...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
