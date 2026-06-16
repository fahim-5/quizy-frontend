import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import QuizzesTable from "../components/QuizzesTable";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [takenResults, setTakenResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [enrollKeyInput, setEnrollKeyInput] = useState("");
  const { user, token } = useAuth() || {};
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  // Default to the `mine` query param only. Do not force teachers to see only
  // their quizzes by default; allow them to toggle the checkbox if desired.
  const initialMine = params.get("mine") === "true";
  const [showOnlyMine, setShowOnlyMine] = useState(initialMine);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sRes = await api.get(
        `/subjects/${id}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );
      const subj = sRes?.data?.subject;
      const enrolled = !!sRes?.data?.isEnrolled;
      setSubject(subj);
      setIsEnrolled(enrolled || (user && user.role === "teacher"));

      if (enrolled || (user && user.role === "teacher")) {
        const mineParam =
          (showOnlyMine || (user && user.role === "teacher")) && user
            ? "&mine=true"
            : "";
        const quizUrl = `/quizzes?subject=${id}&all=true${mineParam}`;
        const qRes = await api.get(
          quizUrl,
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
        );
        setQuizzes(qRes.data.quizzes || qRes.data || []);

        if (user) {
          try {
            const rRes = await api.get(`/results/me`);
            const list = rRes?.data?.results || [];
            const map = {};
            list.forEach((r) => {
              const raw = r.quiz && (r.quiz._id || r.quiz);
              const qid = raw ? String(raw) : null;
              if (qid && r.status === "completed") {
                map[qid] = r;
              }
            });
            setTakenResults(map);
          } catch (e) {
            // ignore
          }
        }
      } else {
        setQuizzes([]);
      }
    } catch (err) {
      console.error("CourseDetail fetch error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load course data";
      const status = err?.response?.status;
      setError(status ? `${msg} (status: ${status})` : msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, showOnlyMine, user]);

  // Delete a quiz (accepts the quiz object) and update local state like TeacherQuizzes
  const deleteQuiz = async (quiz) => {
    if (!confirm("Delete this quiz?")) return;
    try {
      setLoading(true);
      const cfg = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {
            headers: {
              "x-user-id":
                user && (user._id || user.id) ? user._id || user.id : undefined,
              "x-user-email": user && user.email ? user.email : undefined,
            },
          };
      const res = await api.delete(`/quizzes/${quiz._id || quiz.id}`, cfg);
      if (res && (res.data?.success || res.status === 200)) {
        const removedId = res.data?.quizId || quiz._id || quiz.id;
        setQuizzes((prev) =>
          (prev || []).filter(
            (x) => String(x._id || x.id) !== String(removedId),
          ),
        );
      } else {
        // fallback: refetch list
        await fetchData();
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading course...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!subject) return <div className="p-6">Course not found</div>;

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black">{subject.name}</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage quizzes for this course
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
          </div>
          <button
            onClick={fetchData}
            className="border border-gray-300 text-black px-3 py-1 rounded-md mr-2 hover:bg-gray-100 transition-colors"
          >
            Refresh
          </button>
          {user && user.role === "teacher" && (
            <button
              onClick={() => navigate(`/teacher/create?subject=${subject._id}`)}
              className="px-3 py-1 bg-black text-white rounded-md"
            >
              Create Quiz
            </button>
          )}
          <button
            onClick={() => navigate("/teacher/courses")}
            className="border px-3 py-1 rounded-md"
          >
            Back
          </button>
        </div>
      </div>

      <div>
        {!isEnrolled && user && user.role !== "teacher" ? (
          <div className="p-6 bg-yellow-50 border rounded">
            <h3 className="font-semibold mb-2">Enrollment required</h3>
            <p className="text-sm text-gray-700 mb-3">
              You must enroll in this course before viewing its quizzes.
            </p>
            <div className="mb-3">
              <label className="block text-sm text-gray-700">Enroll Key</label>
              <input
                value={enrollKeyInput}
                onChange={(e) => setEnrollKeyInput(e.target.value)}
                className="w-full border px-2 py-1 rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await api.post(
                      `/subjects/${subject._id}/enroll`,
                      { enrollKey: enrollKeyInput },
                      token
                        ? { headers: { Authorization: `Bearer ${token}` } }
                        : undefined,
                    );
                    // reload quizzes
                    const qRes = await api.get(
                      `/quizzes?subject=${id}&all=true${showOnlyMine ? "&mine=true" : ""}`,
                      token
                        ? { headers: { Authorization: `Bearer ${token}` } }
                        : undefined,
                    );
                    setQuizzes(qRes.data.quizzes || qRes.data || []);
                    setIsEnrolled(true);
                  } catch (err) {
                    setError(
                      err?.response?.data?.message ||
                        err.message ||
                        "Enroll failed",
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
                className="px-3 py-1 bg-black text-white rounded-md"
                disabled={loading}
              >
                {loading ? "Enrolling..." : "Enroll"}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-3 py-1 border rounded-md"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-3">Quizzes</h2>
            {quizzes.length === 0 ? (
              <div className="text-sm text-gray-600">
                No quizzes for this course yet.
              </div>
            ) : (
              <QuizzesTable
                quizzes={(quizzes || []).filter((q) => {
                  if (query && query.trim()) {
                    const t = (q.title || q.name || "").toLowerCase();
                    return t.includes(query.trim().toLowerCase());
                  }
                  return true;
                })}
                onQuestions={(q) => navigate(`/teacher/quiz/${q._id || q.id}`)}
                onMonitor={(q) => navigate(`/teacher/monitor/${q._id || q.id}`)}
                onDelete={(q) => deleteQuiz(q)}
                onReport={(q) => navigate(`/teacher/reports/${q._id || q.id}`)}
                studentView={user && user.role !== "teacher"}
                onAttend={(q) => navigate(`/take/${q._id || q.id}`)}
                showJoinKey={user && user.role === "teacher"}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
