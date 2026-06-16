import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import QuizzesTable from "../components/QuizzesTable";

export default function TeacherQuizzes() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [query, setQuery] = useState("");
  // live search query

  useEffect(() => {
    if (!user) return;
    if (user.role !== "teacher") return;
    fetchQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      // request teacher's quizzes (mine=true), include all to get drafts etc.
      const res = await api.get(
        "/quizzes?all=true&mine=true",
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );
      const list = res?.data?.quizzes || res?.data || [];
      // ensure only quizzes created by this teacher and sort by createdAt desc
      const filtered = (list || [])
        .filter(
          (q) =>
            String(q.createdBy?._id || q.createdBy || "") === String(user._id),
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setQuizzes(filtered);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Failed to load quizzes",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q) => {
    navigate(`/quiz/${q._id || q.id}`);
  };
  const handleManage = (q) => {
    // Open the Quiz Editor (Basic info) so teacher can edit time/description first,
    // then proceed to questions. New route: /teacher/quiz/:id/edit
    navigate(`/teacher/quiz/${q._id || q.id}/edit`);
  };
  const handleQuestions = (q) => {
    // Open the Questions manager for this quiz
    navigate(`/teacher/quiz/${q._id || q.id}`);
  };
  const handleDelete = async (q) => {
    if (!confirm("Delete this quiz?")) return;
    try {
      setLoading(true);
      // ensure backend receives current user id header for dev mode auth
      // ensure backend receives current user id/email header for dev mode auth
      const cfg = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {
            headers: {
              "x-user-id":
                user && (user._id || user.id) ? user._id || user.id : undefined,
              "x-user-email": user && user.email ? user.email : undefined,
            },
          };
      const res = await api.delete(`/quizzes/${q._id || q.id}`, cfg);
      // If API reports success, remove the quiz from local state immediately
      if (res && (res.data?.success || res.status === 200)) {
        const removedId = res.data?.quizId || q._id || q.id;
        setQuizzes((prev) =>
          (prev || []).filter(
            (x) => String(x._id || x.id) !== String(removedId),
          ),
        );
      } else {
        await fetchQuizzes();
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (q) => {
    if (!confirm(`Create a copy of \"${q.title}\"?`)) return;
    try {
      setLoading(true);
      await api.post(`/quizzes/${q._id || q.id}/duplicate`);
      await fetchQuizzes();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Copy failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMonitor = (q) => navigate(`/teacher/monitor/${q._id || q.id}`);
  const handleReport = (q) => navigate(`/teacher/reports/${q._id || q.id}`);

  const filteredQuizzes = quizzes.filter((q) => {
    if (query && query.trim()) {
      const t = (q.title || q.name || "").toLowerCase();
      return t.includes(query.trim().toLowerCase());
    }
    return true;
  });

  if (!user) return null;
  if (user.role !== "teacher") return <div className="p-6">Access denied</div>;

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black">Your Quizzes</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage and review your quizzes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex items-center gap-2 bg-gray-50 rounded-md p-2">
              <input
                placeholder="Search quizzes by name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent outline-none text-sm px-2 w-56"
              />
            </div>
            {/* Live suggestions */}
            {query && query.trim() !== "" && (
              <div className="absolute mt-1 w-56 bg-white border rounded shadow z-20">
                {(quizzes || [])
                  .filter((q) =>
                    (q.title || q.name || "")
                      .toLowerCase()
                      .includes(query.trim().toLowerCase()),
                  )
                  .slice(0, 6)
                  .map((q) => (
                    <div
                      key={q._id}
                      onClick={() => navigate(`/teacher/quiz/${q._id || q.id}`)}
                      className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      {q.title || q.name}
                    </div>
                  ))}
              </div>
            )}
          </div>
          <button
            onClick={fetchQuizzes}
            className="border border-gray-300 text-black px-3 py-1 rounded-md mr-2 hover:bg-gray-100 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate("/teacher/create")}
            className="px-3 py-1 bg-black text-white rounded-md"
          >
            Create Quiz
          </button>
        </div>
      </div>

      {loading && <p className="text-black">Loading quizzes...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div>
        <QuizzesTable
          quizzes={filteredQuizzes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onQuestions={handleQuestions}
          onCopy={handleCopy}
          onReport={handleReport}
          onMonitor={handleMonitor}
          showJoinKey={true}
        />
      </div>
    </div>
  );
}
