import React from "react";

export default function Avatar({
  user,
  size = "h-8 w-8",
  className = "",
  iconSize = "h-5 w-5",
}) {
  const role = user && user.role ? user.role : null;
  const display = role === "teacher" ? "teacher" : "student";

  return (
    <div
      className={`${size} ${className} rounded-full bg-black flex items-center justify-center text-white`}
    >
      {display === "teacher" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" />
          <path d="M3 20c0-3.866 4.477-7 9-7s9 3.134 9 7" />
          <rect x="16" y="14" width="5" height="3" rx="0.5" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2l9 4.5-9 4.5-9-4.5L12 2z" />
          <path d="M12 11.5v6.5" />
        </svg>
      )}
    </div>
  );
}