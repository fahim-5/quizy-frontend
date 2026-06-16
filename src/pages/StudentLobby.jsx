import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

export default function StudentLobby() {
  const auth = useAuth();
  const user = auth?.user || {};
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUpcoming();
    fetchCompleted();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUpcoming = async () => {
    setLoading(true);
    try {
      // request quizzes assigned to current student
      const res = await api.get("/quizzes?assigned=true");
      setUpcoming(res?.data?.quizzes || res?.data || []);
    } catch (err) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  const fetchCompleted = async () => {
    try {
      const res = await api.get("/results/me");
      setCompleted(res?.data?.results || []);
    } catch (err) {
      // ignore
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/login");
  };

  const joinByCode = async () => {
    setError(null);
    const clean = String(code || "").trim();
    if (!/^\d{6}$/.test(clean)) {
      setError("Enter a valid 6-digit quiz code");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(`/quizzes/code/${clean}`);
      const quiz = res?.data?.quiz;
      if (!quiz) {
        setError("Quiz not found for that code");
        return;
      }
      // create a draft result so the student can resume/take the quiz
      try {
        const sres = await api.post("/results/start", { quiz: quiz._id });
        const draft = sres?.data?.result || sres?.data;
        navigate(`/quiz/${quiz._id}`, { state: { resultId: draft?._id } });
      } catch (e) {
        // If server indicates quiz already taken, redirect to result view
        const status = e?.response?.status;
        if (status === 409 && e?.response?.data?.result) {
          const existing = e.response.data.result;
          try {
            const r = await api.get(`/results/${existing._id}`);
            const full = r?.data?.result || r?.data;
            navigate("/result", { state: { result: full } });
            return;
          } catch (er) {
            navigate("/result", { state: { result: existing } });
            return;
          }
        }
        // fallback: still navigate if draft creation fails
        navigate(`/quiz/${quiz._id}`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to join quiz");
    } finally {
      setLoading(false);
    }
  };

  const openReview = (result) => {
    navigate("/result", { state: { result } });
  };

  const fmtDate = (d) => {
    if (!d) return "-";
    try {
      const dt = new Date(d);
      return dt.toLocaleString();
    } catch (e) {
      return String(d);
    }
  };

  const fmtDuration = (sec) => {
    if (!sec && sec !== 0) return "N/A";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="page p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              Hello, {user.name || "Student"}
            </h1>
            <div className="text-sm text-gray-600">
              {user.className || user.class || "Class"}
            </div>
          </div>
          <div>
            <button
              className="px-3 py-2 bg-red-500 text-white rounded"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-6 bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Join Quiz</h2>
          <div className="flex gap-3 items-center">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Enter 6-digit Quiz Code"
              className="flex-1 border px-3 py-2 rounded"
            />
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={joinByCode}
              disabled={loading}
            >
              Join
            </button>
          </div>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Upcoming Quizzes</h3>
            {loading && <div>Loading...</div>}
            {!loading && upcoming.length === 0 && (
              <div className="text-sm text-gray-500">No upcoming quizzes</div>
            )}
            <ul className="space-y-3">
              {upcoming.map((q) => (
                <li
                  key={q._id || q.id}
                  className="p-3 border rounded hover:shadow cursor-pointer"
                  onClick={() => navigate(`/quiz/${q._id || q.id}`)}
                >
                  <div className="font-medium">{q.title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Date: {fmtDate(q.startFrom || q.visibleFrom)} • Duration:{" "}
                    {fmtDuration(q.timeLimit)}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded shadow p-6">
            <h3 className="text-lg font-semibold mb-3">Completed Quizzes</h3>
            {completed.length === 0 && (
              <div className="text-sm text-gray-500">No attempts yet</div>
            )}
            <ul className="space-y-3">
              {completed.map((r) => (
                <li
                  key={r._id}
                  className="p-3 border rounded flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      {r.quiz?.title || "(quiz removed)"}
                    </div>
                    <div className="text-sm text-gray-500">
                      Score: {r.score ?? "-"} / {r.total ?? "-"} •{" "}
                      {fmtDate(r.takenAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      onClick={() => openReview(r)}
                    >
                      Review
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
