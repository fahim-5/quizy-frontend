import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Reports() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [studentReport, setStudentReport] = useState(null);

  useEffect(() => {
    if (!quizId) return;
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/results/teacher/quiz/${quizId}/analysis`);
      setData(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const res = await api.get(`/results/teacher/quiz/${quizId}/export`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `leaderboard_${quizId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Export failed");
    }
  };

  const openStudentReport = async (student) => {
    const sid =
      student && student._id ? student._id : student.identifier || student.name;
    try {
      setStudentReport(null);
      const res = await api.get(
        `/results/teacher/quiz/${quizId}/student/${sid}`,
      );
      setStudentReport(res.data.results || []);
    } catch (err) {
      alert("Failed to load student report");
    }
  };

  if (!quizId) return <div className="p-6">No quiz selected.</div>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Reports & Analytics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-1 border rounded"
          >
            Back
          </button>
          <button
            onClick={downloadCSV}
            className="px-3 py-1 bg-green-600 text-white rounded"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {data && (
        <div className="space-y-6">
          <div className="p-4 border rounded">
            <div className="text-sm text-gray-600">Class Average</div>
            <div className="text-2xl font-bold">{data.classAvgPercent}%</div>
          </div>

          <div className="p-4 border rounded">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Question-wise Analysis</div>
            </div>
            <div className="mt-3 space-y-2">
              {data.analysis && data.analysis.length === 0 && (
                <div className="text-gray-500">No question data yet.</div>
              )}
              {data.analysis &&
                data.analysis.map((q) => (
                  <div
                    key={q.questionId}
                    className="p-2 border rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="font-medium">{q.text}</div>
                      <div className="text-sm text-gray-500">
                        Attempts: {q.total} • Correct: {q.correct}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{q.percent}%</div>
                      <div className="text-sm text-gray-600">
                        {q.difficulty}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="p-4 border rounded">
            <div className="font-semibold">Top Performers</div>
            <div className="mt-3">
              {data.topPerformers && data.topPerformers.length === 0 && (
                <div className="text-gray-500">No results yet.</div>
              )}
              <ul className="space-y-2">
                {data.topPerformers &&
                  data.topPerformers.map((t, idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      <div>
                        <div
                          className="font-medium cursor-pointer text-blue-600"
                          onClick={() => openStudentReport(t)}
                        >
                          {t.name || t.identifier || "Guest"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t.identifier || ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {t.bestScore}/{t.total}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t.lastTaken
                            ? new Date(t.lastTaken).toLocaleString()
                            : ""}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      {studentReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white max-w-2xl w-full p-4 rounded">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Student Report</h3>
              <button
                onClick={() => setStudentReport(null)}
                className="px-2 py-1 border rounded"
              >
                Close
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {studentReport.length === 0 && (
                <div className="text-gray-500">No attempts</div>
              )}
              {studentReport.map((r) => (
                <div key={r._id} className="p-2 border rounded">
                  <div className="text-sm text-gray-500">
                    Taken:{" "}
                    {r.takenAt ? new Date(r.takenAt).toLocaleString() : ""} —
                    Score: {r.score}/{r.total}
                  </div>
                  <div className="mt-2 space-y-1">
                    {r.answers &&
                      r.answers.map((a, i) => (
                        <div key={i} className="text-sm">
                          <div className="font-medium">
                            {a.question?.text || "Question"}
                          </div>
                          <div className="text-gray-600">
                            Answer:{" "}
                            {typeof a.answerIndex !== "undefined"
                              ? String(a.answerIndex)
                              : a.answer || ""}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
