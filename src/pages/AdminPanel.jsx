import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import DashboardStats from "../components/DashboardStats";
import QuizzesTable from "../components/QuizzesTable";
import UsersTable from "../components/UsersTable";
import TeacherAnalytics from "../components/AdminAnalytics";

export default function AdminPanel() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ users: 0, quizzes: 0, results: 0 });
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [lastDeleted, setLastDeleted] = useState(null); // { id, title }

  useEffect(() => {
    if (!user) return; // wait for auth
    if (user && user.role !== "teacher") return; // don't fetch if not teacher
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);

    try {
      // Teachers should request only their quizzes (mine=true). Fall back to server filtering.
      const quizzesUrl =
        user && user.role === "teacher"
          ? "/quizzes?all=true&mine=true"
          : "/quizzes";
      const [usersRes, quizzesRes, resultsRes] = await Promise.allSettled([
        api.get("/users"),
        api.get(quizzesUrl),
        api.get("/results"),
      ]);

      if (
        usersRes.status === "fulfilled" &&
        Array.isArray(usersRes.value.data)
      ) {
        setUsers(usersRes.value.data);
        setStats((s) => ({ ...s, users: usersRes.value.data.length }));
      }

      if (quizzesRes.status === "fulfilled") {
        const data = quizzesRes.value.data;
        const list = Array.isArray(data)
          ? data
          : data?.quizzes || data?.results || [];
        // Ensure teacher only sees their own quizzes client-side as a safety net
        const filtered =
          user && user.role === "teacher"
            ? list.filter(
                (q) =>
                  String(q.createdBy?._id || q.createdBy || "") ===
                  String(user._id),
              )
            : list;
        setQuizzes(filtered);
        setStats((s) => ({ ...s, quizzes: filtered.length }));
      }

      if (resultsRes.status === "fulfilled") {
        const data = resultsRes.value.data;
        const list = Array.isArray(data) ? data : data?.results || [];
        setResults(list || []);
        const count = Array.isArray(data) ? data.length : data.count || 0;
        setStats((s) => ({ ...s, results: count }));
      }
    } catch (err) {
      setError(err.message || "Failed to fetch teacher data");
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuiz = (quiz) => {
    // TODO: open quiz editor modal or navigate to edit page
    navigate(`/quiz/${quiz._id || quiz.id}`);
  };

  const handleManageQuiz = (quiz) => {
    navigate(`/teacher/quiz/${quiz._id || quiz.id}`);
  };

  const handleCreateQuiz = async (e) => {
    e && e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const payload = {
        title: newQuiz.title,
        description: newQuiz.description,
        // admin/new-quiz input is minutes — convert to seconds for backend
        timeLimit: (Number(newQuiz.timeLimit) || 0) * 60,
        rules: newQuiz.rules,
        visibleFrom: newQuiz.visibleFrom || undefined,
        startFrom: newQuiz.startFrom || undefined,
      };
      await api.post("/quizzes", payload);
      // default timeLimit in minutes (30 minutes)
      setNewQuiz({ title: "", description: "", timeLimit: 30, rules: "" });
      setShowCreate(false);
      await fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quiz) => {
    if (!confirm("Delete this quiz? You can undo within 30s.")) return;
    try {
      setLoading(true);
      await api.delete(`/quizzes/${quiz._id || quiz.id}`);
      setLastDeleted({ id: quiz._id || quiz.id, title: quiz.title });
      await fetchAll();
      setTimeout(() => setLastDeleted(null), 30000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTemplate = async (quiz) => {
    if (!confirm(`Create a copy of "${quiz.title}"?`)) return;
    try {
      setLoading(true);
      const res = await api.post(`/quizzes/${quiz._id || quiz.id}/duplicate`);
      await fetchAll();
      alert(`Created copy: ${res.data.quiz.title}`);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Copy failed");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMonitor = (quiz) => {
    navigate(`/teacher/monitor/${quiz._id || quiz.id}`);
  };

  const handleOpenReports = (quiz) => {
    navigate(`/teacher/reports/${quiz._id || quiz.id}`);
  };

  const handleUndo = async () => {
    if (!lastDeleted) return;
    try {
      setLoading(true);
      await api.post(`/quizzes/${lastDeleted.id}/undo`);
      setLastDeleted(null);
      await fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Undo failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async (userObj) => {
    if (!confirm(`Promote ${userObj.email || userObj.name} to teacher?`))
      return;
    try {
      setLoading(true);
      await api.put(`/users/${userObj._id || userObj.id}`, { role: "teacher" });
      await fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Promote failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userObj) => {
    if (!confirm(`Deactivate ${userObj.email || userObj.name}?`)) return;
    try {
      setLoading(true);
      await api.delete(`/users/${userObj._id || userObj.id}`);
      await fetchAll();
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Deactivate failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header: welcome, date, logout */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black">
            Welcome, {user?.name || user?.email || "Teacher"}
          </h2>
          <div className="text-sm text-gray-600">
            {new Date().toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="border border-gray-300 text-black px-3 py-1 rounded-md mr-2 hover:bg-gray-100 transition-colors"
            onClick={fetchAll}
            disabled={loading}
          >
            Refresh
          </button>
          <button
            className="text-sm px-3 py-1 border border-gray-200 rounded-md hover:bg-gray-50"
            onClick={() => logout && logout()}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate("/reports")}
          className="flex items-center justify-center gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-sm"
        >
          <span className="text-2xl">📊</span>
          <div className="text-left">
            <div className="font-semibold">View Reports</div>
            <div className="text-sm text-gray-600">Analytics & CSV exports</div>
          </div>
        </button>
        <button
          onClick={() => navigate("/teacher/students")}
          className="flex items-center justify-center gap-3 p-4 border border-gray-200 rounded-lg hover:shadow-sm"
        >
          <span className="text-2xl">👥</span>
          <div className="text-left">
            <div className="font-semibold">Manage Students</div>
            <div className="text-sm text-gray-600">
              Invite or remove students
            </div>
          </div>
        </button>
      </div>

      {loading && <p className="text-black">Loading teacher data...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <DashboardStats stats={stats} />

      <div className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <QuizzesTable
              quizzes={quizzes.slice(0, 10)}
              onEdit={handleEditQuiz}
              onDelete={handleDeleteQuiz}
              onManage={handleManageQuiz}
              onCopy={handleCopyTemplate}
              onMonitor={handleOpenMonitor}
              onReport={handleOpenReports}
            />
          </div>
          <div>
            <TeacherAnalytics />
          </div>
        </div>
        {lastDeleted && (
          <div className="mt-2 p-3 bg-gray-100 border-l-4 border-black">
            Deleted "{lastDeleted.title}" —{" "}
            <button
              className="text-black underline font-medium"
              onClick={handleUndo}
            >
              Undo
            </button>{" "}
            (30s)
          </div>
        )}
      </div>

      <div>
        <UsersTable
          users={users.slice(0, 12)}
          onPromote={handlePromoteUser}
          onDeactivate={handleDeactivateUser}
        />
      </div>
    </div>
  );
}
