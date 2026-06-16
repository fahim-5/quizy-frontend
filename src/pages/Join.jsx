import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaUser, FaKey } from "react-icons/fa";
import api from "../services/api";

export default function Join() {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);

    const trimmed = String(code || "").trim();

    if (!trimmed) {
      return setError("Please enter the 6-digit code");
    }

    setLoading(true);

    try {
      const res = await api.get(
        `/quizzes/code/${encodeURIComponent(trimmed)}`
      );

      const quiz = res.data.quiz || res.data;

      if (!quiz) {
        return setError("Quiz not found for that code");
      }

      navigate(`/quiz/${quiz._id}`, {
        state: { guestName: name || undefined },
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to find quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-10">
      <div className="relative w-full max-w-md">
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-black/5 blur-3xl rounded-full" />

        {/* Card */}
        <div className="relative bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl rounded-3xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-black text-white flex items-center justify-center shadow-lg mb-4">
              <FaKey size={24} />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
              Join a Quiz
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              Enter your quiz code and start playing instantly 🚀
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Quiz Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quiz Code
              </label>

              <div className="relative">
                <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-black focus:ring-4 focus:ring-black/10 outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>

              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:border-black focus:ring-4 focus:ring-black/10 outline-none transition-all duration-300"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full group bg-black hover:bg-gray-900 text-white py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Quiz
                  <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              Make sure you have the correct quiz code before joining.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}