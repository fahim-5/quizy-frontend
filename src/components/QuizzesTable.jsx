import React from "react";

export default function QuizzesTable({
  quizzes = [],
  onEdit = () => {},
  onDelete = () => {},
  onManage,
  onQuestions = () => {},
  onCopy = () => {},
  onMonitor = () => {},
  onReport = () => {},
  // student view: show a single Attend/Start button
  studentView = false,
  onAttend = () => {},
  // show joinCode (enroll key) when available and not the reserved open code
  showJoinKey = false,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Quizzes</h3>
      </div>
      {quizzes.length === 0 ? (
        <p className="text-gray-500">No quizzes available.</p>
      ) : (
        <ul className="space-y-3">
          {quizzes.map((q) => (
            <li
              key={q._id || q.id}
              className="p-4 bg-white rounded shadow flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="flex-1">
                <div className="font-semibold text-black text-lg">
                  {q.title || q.name || "Untitled"}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {q.description || ""}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  <span className="mr-3">
                    Duration: {q.timeLimit ? `${q.timeLimit}s` : "—"}
                  </span>
                  <span>Rules: {q.rules || "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {showJoinKey && (
                  <div className="text-sm text-gray-600 mr-2">
                    {q.joinCode && String(q.joinCode).trim() !== "1234"
                      ? `Key: ${q.joinCode}`
                      : ""}
                  </div>
                )}
                {studentView ? (
                  <button
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
                    onClick={() => onAttend(q)}
                  >
                    Attend Quiz
                  </button>
                ) : (
                  <>
                    {typeof onManage === "function" ? (
                      <button
                        className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
                        onClick={() => onManage(q)}
                      >
                        Manage
                      </button>
                    ) : null}
                    <button
                      className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
                      onClick={() => onQuestions(q)}
                    >
                      Questions
                    </button>
                    {/* Edit and Copy removed per UX request */}
                    {typeof onMonitor === "function" ? (
                      <button
                        className="px-2 py-1 bg-white border border-indigo-100 text-sm rounded hover:bg-indigo-50"
                        onClick={() => onMonitor(q)}
                      >
                        Monitor
                      </button>
                    ) : null}
                    <button
                      className="px-2 py-1 bg-white border border-gray-200 text-sm rounded hover:bg-gray-50"
                      onClick={() => onReport(q)}
                    >
                      Reports
                    </button>
                    <button
                      className="px-2 py-1 bg-white border border-red-200 text-red-600 text-sm rounded hover:bg-red-50"
                      onClick={() => onDelete(q)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
