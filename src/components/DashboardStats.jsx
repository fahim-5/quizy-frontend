import React from "react";

export default function DashboardStats({ stats = {} }) {
  const cards = [
    {
      key: "users",
      label: "Users",
      value: stats.users ?? 0,
      icon: "👥",
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      key: "quizzes",
      label: "Quizzes",
      value: stats.quizzes ?? 0,
      icon: "📝",
      color: "bg-green-50 text-green-700",
    },
    {
      key: "results",
      label: "Results",
      value: stats.results ?? 0,
      icon: "📊",
      color: "bg-yellow-50 text-yellow-700",
    },
  ];

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {cards.map((c) => (
        <div
          key={c.key}
          className="p-4 bg-white rounded shadow flex items-center gap-4"
        >
          <div className={`p-3 rounded-md text-xl ${c.color}`}>{c.icon}</div>
          <div>
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className="text-2xl font-bold text-black">{c.value}</div>
          </div>
        </div>
      ))}
    </section>
  );
}
