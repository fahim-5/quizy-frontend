import React, { useEffect, useState } from "react";
import api from "../services/api";

export default function ResultsHistory() {
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [rRes, sRes] = await Promise.all([
          api.get("/results/me"),
          api.get("/results/me/summary"),
        ]);
        const list = rRes.data.results || [];
        // Sort newest first by takenAt (fallback to createdAt)
        list.sort((a, b) => {
          const ta = new Date(b.takenAt || b.createdAt || 0).getTime();
          const tb = new Date(a.takenAt || a.createdAt || 0).getTime();
          return ta - tb;
        });
        setResults(list);
        setSummary(sRes.data.summary || null);
      } catch (err) {
        console.error("Failed to load results:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading results...</div>;

  return (
    <div className="page results-history p-6">
      <h2 className="text-2xl font-bold mb-4">My Results</h2>

      {summary && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <div className="flex gap-6">
            <div>
              <strong>Attempts:</strong> {summary.attempts}
            </div>
            <div>
              <strong>Average %:</strong> {summary.avgPercent}%
            </div>
            <div>
              <strong>Best Score:</strong> {summary.bestScore}
            </div>
            <div>
              <strong>Last Taken:</strong>{" "}
              {summary.lastTaken
                ? new Date(summary.lastTaken).toLocaleString()
                : "-"}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {results.length === 0 && <div>No results yet.</div>}
        {results.map((r) => (
          <div
            key={r._id}
            className="p-3 border rounded flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{r.quiz?.title || "Quiz"}</div>
              <div className="text-sm text-gray-600">
                Score: {r.score} / {r.total} • Duration: {r.duration ?? "-"}s
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {r.takenAt ? new Date(r.takenAt).toLocaleString() : "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
