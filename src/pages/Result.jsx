import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

export default function Result() {
  const { state } = useLocation();
  const score = state?.score ?? null;
  const total = state?.total ?? null;

  const auth = useAuth();
  const user = auth?.user;

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role === "teacher") fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/quizzes?all=true");
      const list = res?.data?.quizzes || res?.data || [];
      setQuizzes(list);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Failed to load quizzes",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (quizId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/questions/quiz/${quizId}`);
      const list = res?.data?.questions || res?.data || [];
      setQuestions(list);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load questions",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async (id, updates) => {
    try {
      await api.put(`/questions/${id}`, updates);
      // reflect change locally
      setQuestions((q) =>
        q.map((item) =>
          item._id === id || item.id === id ? { ...item, ...updates } : item,
        ),
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Update failed");
    }
  };

  const saveAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all(
        questions.map((q) =>
          api.put(`/questions/${q._id || q.id}`, {
            text: q.text,
            options: q.options,
            correctIndex: q.correctIndex,
            points: q.points,
          }),
        ),
      );
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  if (user && user.role === "teacher") {
    return (
      <div className="page result-page p-6">
        <h2 className="text-2xl font-bold mb-4">Teacher: Set Answer Key</h2>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}

        <div className="mb-4">
          <label className="block text-sm font-medium">Select Quiz</label>
          <select
            value={selectedQuiz || ""}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedQuiz(id);
              if (id) loadQuestions(id);
            }}
            className="border px-2 py-1"
          >
            <option value="">-- select --</option>
            {quizzes.map((q) => (
              <option key={q._id || q.id} value={q._id || q.id}>
                {q.title}
              </option>
            ))}
          </select>
        </div>

        {questions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Questions</h3>
            <ul className="space-y-3">
              {questions.map((q) => (
                <li key={q._id || q.id} className="p-3 bg-white rounded shadow">
                  <div className="font-medium">{q.text}</div>
                  <div className="mt-2 space-y-1">
                    {(q.options || []).map((opt, i) => (
                      <label key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${q._id || q.id}`}
                          checked={q.correctIndex === i}
                          onChange={() =>
                            updateQuestion(q._id || q.id, { correctIndex: i })
                          }
                        />
                        <span>{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <button
                className="btn-primary mr-2"
                onClick={saveAll}
                disabled={loading}
              >
                Save All
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Student view: show immediate result if provided in state
  // Student view: show detailed result and question review
  const [result, setResult] = useState(state?.result || null);

  useEffect(() => {
    // If a full result object was passed via navigation state, use it.
    // Otherwise fetch the user's latest completed result.
    const loadLatest = async () => {
      if (result) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/results/me");
        const list = res?.data?.results || [];
        if (list.length > 0) setResult(list[0]);
        else setError("No result data available");
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load result",
        );
      } finally {
        setLoading(false);
      }
    };
    loadLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fmtTime = (sec) => {
    if (!sec && sec !== 0) return "-";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const renderOption = (qObj, opt, idx, userSelected, correctIndex) => {
    const isCorrect =
      typeof correctIndex !== "undefined" && idx === correctIndex;
    const isSelected = userSelected === idx;
    const base = "p-3 border rounded mb-2";
    const className = isCorrect
      ? `${base} bg-green-50 border-green-200`
      : isSelected
        ? `${base} bg-red-50 border-red-200`
        : `${base} bg-white border-gray-200`;

    return (
      <div key={idx} className={className}>
        <div className="flex justify-between items-start">
          <div>{opt.text}</div>
          <div>
            {isCorrect && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                Correct
              </span>
            )}
            {!isCorrect && isSelected && (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded">
                Your Answer
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  if (!result) {
    return (
      <div className="page result-page p-6">
        <h2 className="text-2xl font-bold">Results</h2>
        <p>No result data available.</p>
      </div>
    );
  }

  const pct = result.total
    ? Math.round((result.score / result.total) * 100)
    : 0;

  return (
    <div className="page result-page p-6">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <div className="flex flex-col items-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
              pct >= 50 ? "bg-green-100" : "bg-red-100"
            }`}
          >
            {pct >= 50 ? (
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-10 h-10 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </div>

          <h2 className="text-3xl font-bold text-center mb-2">
            Quiz Completed!
          </h2>
          {pct < 50 && (
            <div className="mt-1 text-sm px-3 py-1 bg-red-50 text-red-600 rounded">
              Keep Trying!
            </div>
          )}

          <p className="text-center text-gray-600 mb-4 mt-3 text-lg font-medium">
            {result.quiz && result.quiz.title}
          </p>

          <div className="text-center w-full">
            <div className="text-6xl font-extrabold text-red-600">{pct}%</div>
            <div className="text-sm text-gray-500 mt-1">
              {result.score} out of {result.total} points
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-6 overflow-hidden">
              <div className="h-3 bg-red-600" style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="mt-6 border-t pt-4 grid grid-cols-3 gap-4 text-center text-sm text-gray-700 w-full">
            <div>
              <div className="text-xs text-gray-500">Time Taken</div>
              <div className="font-semibold">{fmtTime(result.duration)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Your Rank</div>
              <div className="font-semibold">{result.rank ?? "-"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Accuracy</div>
              <div className="font-semibold">{pct}%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-6">
        <h3 className="text-lg font-semibold mb-3">Question Review</h3>
        <div className="space-y-4">
          {(result.answers || []).map((a, i) => {
            const q = a.question || {};
            const userIdx =
              typeof a.answerIndex !== "undefined" ? a.answerIndex : null;
            const correctIdx = q.correctIndex;
            return (
              <div key={i} className="p-4 bg-gray-50 border rounded">
                <div className="mb-3 font-medium">
                  Q{i + 1} {q.text || "(question deleted)"}
                </div>
                <div>
                  {(q.options || []).map((opt, idx) =>
                    renderOption(q, opt, idx, userIdx, correctIdx),
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Points: {q.points || 0} / {q.points || 0}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
