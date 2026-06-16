import React, { useEffect, useState } from "react";

export default function Timer({
  initialSeconds = 60,
  onExpire,
  className = "",
}) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire && onExpire();
      return;
    }

    const id = setInterval(() => setSeconds((s) => s - 1), 1000);

    return () => clearInterval(id);
  }, [seconds, onExpire]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  // Progress Calculation
  const progress = (seconds / initialSeconds) * 100;

  // Dynamic Colors
  const isWarning = seconds <= 30;
  const isDanger = seconds <= 10;

  return (
    <div
      className={`relative overflow-hidden inline-flex items-center gap-3 px-4 py-2 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-md shadow-md transition-all duration-300 ${className}`}
    >
      {/* Progress Background */}
      <div
        className={`absolute left-0 top-0 h-full transition-all duration-1000 ${
          isDanger
            ? "bg-red-100"
            : isWarning
            ? "bg-yellow-100"
            : "bg-blue-100"
        }`}
        style={{ width: `${progress}%` }}
      />

      {/* Icon */}
      <div
        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full shadow-sm ${
          isDanger
            ? "bg-red-500 text-white animate-pulse"
            : isWarning
            ? "bg-yellow-500 text-white"
            : "bg-blue-600 text-white"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Time */}
      <div className="relative z-10 flex flex-col leading-none">
        <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">
          Time Left
        </span>

        <span
          className={`text-lg font-bold tabular-nums ${
            isDanger
              ? "text-red-600"
              : isWarning
              ? "text-yellow-600"
              : "text-gray-800"
          }`}
        >
          {mm}:{ss}
        </span>
      </div>
    </div>
  );
}