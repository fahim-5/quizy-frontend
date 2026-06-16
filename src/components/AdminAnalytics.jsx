import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function TeacherAnalytics() {
  const [participation, setParticipation] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [quizStats, setQuizStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Fetch participation summary and teacher quizzes so we can show
        // all teacher quizzes in the select (even those with zero attempts).
        const [pRes, qRes] = await Promise.allSettled([
          api.get("/results/teacher/participation"),
          // Request all quizzes; we'll merge and filter locally if needed
          api.get("/quizzes?all=true"),
        ]);

        const part = pRes.status === "fulfilled" ? pRes.value.data.participation || [] : [];
        const quizzes =
          qRes.status === "fulfilled"
            ? (Array.isArray(qRes.value.data) ? qRes.value.data : qRes.value.data.quizzes || [])
            : [];

        // Build a map of participation by quizId
        const partMap = {};
        part.forEach((p) => {
          partMap[String(p.quizId)] = p;
        });

        // Combine quizzes and participation into a single list for the select
        const combined = quizzes.map((q) => {
          const id = q._id || q.id;
          const p = partMap[String(id)];
          return {
            quizId: id,
            title: q.title || q.name || (p && p.title) || id,
            attempts: p ? p.attempts : 0,
          };
        });

        // Also include any participation entries for quizzes not returned in quizzes list
        part.forEach((p) => {
          const exists = combined.find((c) => String(c.quizId) === String(p.quizId));
          if (!exists) {
            combined.push({ quizId: p.quizId, title: p.title || p.quizId, attempts: p.attempts });
          }
        });

        setParticipation(combined);
        if (combined.length > 0) setSelectedQuiz(combined[0].quizId);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedQuiz) return;
    const loadQuiz = async () => {
      try {
        const params = new URLSearchParams();
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        params.set("limit", String(limit));
        params.set("skip", String(page * limit));

        const [lbRes, stRes] = await Promise.all([
          api.get(
            `/results/teacher/leaderboard/${selectedQuiz}?${params.toString()}`,
          ),
          api.get(
            `/results/teacher/quiz/${selectedQuiz}/stats?${params.toString()}`,
          ),
        ]);
        setLeaderboard(lbRes.data.leaderboard || []);
        setQuizStats(stRes.data.stats || null);
      } catch (err) {
        console.error(err);
      }
    };
    loadQuiz();
  // reload when selected quiz or filters/pagination change
  }, [selectedQuiz, page, limit, startDate, endDate]);

  if (loading) return <div className="text-black">Loading analytics...</div>;

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold text-black mb-3">Participation & Scores</h3>
      <div className="mb-3">
        <label className="block text-sm font-medium text-black">Quiz</label>
        <select
          className="w-full border border-gray-300 rounded-md p-2 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          value={selectedQuiz || ""}
          onChange={(e) => setSelectedQuiz(e.target.value)}
        >
          {participation.map((p) => (
            <option key={p.quizId} value={p.quizId}>
              {p.title || p.quizId} — {p.attempts} attempts
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <div>
          <label className="block text-sm text-black">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm text-black">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm text-black">Per page</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(0);
            }}
            className="w-full border border-gray-300 rounded-md p-2 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <button
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          onClick={() => {
            setPage(0);
            /* reload effect */ setSelectedQuiz((s) => s);
          }}
        >
          Apply
        </button>
        <button
          className="border border-black text-black px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
          onClick={async () => {
            if (!selectedQuiz) return;
            const params = new URLSearchParams();
            if (startDate) params.set("startDate", startDate);
            if (endDate) params.set("endDate", endDate);
            const url = `/results/teacher/quiz/${selectedQuiz}/export?${params.toString()}`;
            try {
              const resp = await api.get(url, { responseType: "blob" });
              const blob = new Blob([resp.data], { type: "text/csv" });
              const link = document.createElement("a");
              link.href = window.URL.createObjectURL(blob);
              link.download = `leaderboard_${selectedQuiz}.csv`;
              link.click();
            } catch (err) {
              console.error("Export failed", err);
            }
          }}
        >
          Export CSV
        </button>
      </div>

      {quizStats && (
        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="text-black">
            <strong>Attempts:</strong> {quizStats.attempts}
          </div>
          <div className="text-black">
            <strong>Average %:</strong> {quizStats.avgPercent}%
          </div>
          <div className="text-black">
            <strong>Top Score:</strong> {quizStats.topScore}
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-black mb-2">Leaderboard</h4>
        {leaderboard.length === 0 && <div className="text-gray-700">No entries yet.</div>}
        <ol className="list-decimal pl-6">
          {leaderboard.map((e, i) => (
            <li key={i} className="mb-2">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium text-black">{e.user?.name || "Unknown"}</div>
                  <div className="text-sm text-gray-700">
                    {e.user?.identifier || ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-black">
                    {e.bestScore} / {e.total}
                  </div>
                  <div className="text-xs text-gray-600">
                    {e.lastTaken ? new Date(e.lastTaken).toLocaleString() : ""}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-2 flex gap-2 items-center">
          <button
            className="border border-gray-300 text-black px-3 py-1 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Prev
          </button>
          <div className="px-2 text-black">Page {page + 1}</div>
          <button
            className="border border-gray-300 text-black px-3 py-1 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={leaderboard.length < limit}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}