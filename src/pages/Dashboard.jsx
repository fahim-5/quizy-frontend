import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import QuizCard from "../components/QuizCard";

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [enrollModal, setEnrollModal] = useState({
    show: false,
    subject: null,
    enrollKey: "",
    error: null,
    loading: false,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchData = async () => {
    setLoading(true);
    try {
      const quizUrl =
        user && user.role === "teacher"
          ? "/quizzes?all=true&mine=true"
          : "/quizzes";
      // For students we need quizzes, their own results, and subjects
      if (user && user.role === "teacher") {
        const [qRes, sRes] = await Promise.all([
          api.get(
            quizUrl,
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined,
          ),
          // fetch only subjects/courses owned by this teacher
          api.get(
            `/subjects?teacherId=${user._id}`,
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined,
          ),
        ]);
        setQuizzes(qRes.data.quizzes || qRes.data || []);
        setSubjects((sRes && (sRes.data.subjects || sRes.data)) || []);
        setResults([]);
      } else {
        const [qRes, rRes, sRes] = await Promise.all([
          api.get(
            quizUrl,
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined,
          ),
          api.get(
            "/results/me",
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined,
          ),
          api.get(
            "/subjects",
            token
              ? { headers: { Authorization: `Bearer ${token}` } }
              : undefined,
          ),
        ]);
        setQuizzes(qRes.data.quizzes || qRes.data || []);
        setResults((rRes && (rRes.data?.results || rRes.data)) || []);
        setSubjects((sRes && (sRes.data.subjects || sRes.data)) || []);
      }
    } catch (err) {
      try {
        const qOnly = await api.get(
          user && user.role === "teacher"
            ? "/quizzes?all=true&mine=true"
            : "/quizzes",
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
        );
        setQuizzes(qOnly.data.quizzes || qOnly.data || []);
        // attempt to load subjects as fallback
        try {
          const sOnly = await api.get("/subjects");
          setSubjects(sOnly.data.subjects || sOnly.data || []);
        } catch (e) {}
      } catch (e) {
        // ignore
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const onFocus = () => fetchData();
    const onVis = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // If someone who is not a teacher visits /dashboard/teacher, redirect them
  useEffect(() => {
    if (
      location?.pathname &&
      location.pathname.startsWith("/dashboard/teacher") &&
      user &&
      user.role !== "teacher"
    ) {
      navigate("/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.pathname, user]);

  // Re-fetch when the route changes back to the dashboard (fixes missing courses after navigation)
  useEffect(() => {
    if (location?.pathname && location.pathname.startsWith("/dashboard")) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.pathname]);

  // realtime clock for dashboard
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  function handleStart(quiz) {
    navigate(`/quiz/${quiz._id}`);
  }

  return (
    <div className="page dashboard-page p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">
              Welcome back, {user?.name || user?.username || "Student"}! 💚
            </h1>
            <p className="text-gray-600 mt-1"></p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-sm text-gray-600">
              {now.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="text-sm text-gray-600">
              {now.toLocaleTimeString()}
            </div>
            <div>
              <button
                onClick={() => fetchData()}
                className="ml-4 px-3 py-1 border rounded text-sm"
                disabled={loading}
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </header>

        {user && user.role === "teacher" ? (
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subjects
                  .filter(
                    (s) =>
                      s &&
                      (s.createdBy?._id === user._id ||
                        s.createdBy === user._id),
                  )
                  .slice(0, 3)
                  .map((s) => (
                    <div key={s._id} className="p-4 bg-white rounded shadow">
                      <h3 className="font-semibold text-black">{s.name}</h3>
                      <p className="text-sm text-gray-600">{s.code}</p>
                      <div className="mt-3">
                        <button
                          onClick={() => navigate(`/teacher/courses/${s._id}`)}
                          className="px-3 py-1 bg-black text-white rounded-md"
                        >
                          Manage Course
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">Your Quizzes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quizzes
                  .filter(
                    (q) =>
                      String(q.createdBy?._id || q.createdBy || "") ===
                      String(user._id),
                  )
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 3)
                  .map((q) => (
                    <div key={q._id} className="">
                      <QuizCard quiz={q} onStart={() => handleStart(q)} />
                    </div>
                  ))}
              </div>
            </section>
          </div>
        ) : (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Performance</h2>
              <div>
                <button
                  onClick={() => navigate("/results")}
                  className="text-sm text-gray-600"
                >
                  View All Results
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded shadow p-4">
                  <h3 className="text-lg font-medium mb-3">Recent Attempts</h3>
                  {results.length === 0 ? (
                    <div className="text-sm text-gray-600">
                      You have no attempts yet.
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {results.slice(0, 6).map((r) => (
                        <li
                          key={r._id}
                          className="p-3 bg-gray-50 rounded flex items-center justify-between"
                        >
                          <div>
                            <div className="font-semibold">
                              {r.quiz?.title || "Quiz"}
                            </div>
                            <div className="text-sm text-gray-500">
                              Taken:{" "}
                              {r.takenAt
                                ? new Date(r.takenAt).toLocaleString()
                                : "-"}
                            </div>
                            <div className="text-sm text-gray-500">
                              Answered: {(r.answers || []).length} questions
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {r.total
                                ? Math.round((r.score / r.total) * 100)
                                : 0}
                              %
                            </div>
                            <div className="text-sm text-gray-600">
                              {r.score} / {r.total} pts
                            </div>
                            <div className="mt-2">
                              <button
                                onClick={async () => {
                                  // fetch populated result and navigate to result view
                                  try {
                                    const res = await api.get(
                                      `/results/${r._id}`,
                                    );
                                    const full = res?.data?.result || res?.data;
                                    navigate("/result", {
                                      state: { result: full },
                                    });
                                  } catch (e) {
                                    navigate("/result", {
                                      state: { result: r },
                                    });
                                  }
                                }}
                                className="px-3 py-1 bg-black text-white rounded text-sm"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <div className="bg-white rounded shadow p-4">
                  <h3 className="text-lg font-medium mb-3">Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="text-sm text-gray-600">Attempts</div>
                      <div className="font-semibold">{results.length}</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-sm text-gray-600">Average %</div>
                      <div className="font-semibold">
                        {(() => {
                          const totalPoints = results.reduce(
                            (acc, r) => acc + (r.total || 0),
                            0,
                          );
                          const totalScore = results.reduce(
                            (acc, r) => acc + (r.score || 0),
                            0,
                          );
                          return totalPoints
                            ? Math.round((totalScore / totalPoints) * 100)
                            : 0;
                        })()}
                        %
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-sm text-gray-600">Best Score</div>
                      <div className="font-semibold">
                        {results.reduce(
                          (acc, r) => Math.max(acc, r.score || 0),
                          0,
                        )}{" "}
                        pts
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="text-sm text-gray-600">
                        Questions Attempted
                      </div>
                      <div className="font-semibold">
                        {results.reduce(
                          (acc, r) =>
                            acc + ((r.answers && r.answers.length) || 0),
                          0,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        {enrollModal.show && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/40">
            <div className="bg-white p-6 rounded-md w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                Enroll in {enrollModal.subject?.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Enter the enroll key provided by the instructor to join this
                course.
              </p>
              {enrollModal.error && (
                <div className="text-red-600 mb-2">{enrollModal.error}</div>
              )}
              <div className="mb-3">
                <label className="block text-sm text-gray-700">
                  Enroll Key
                </label>
                <input
                  className="w-full border px-2 py-1 rounded-md"
                  value={enrollModal.enrollKey}
                  onChange={(e) =>
                    setEnrollModal((m) => ({ ...m, enrollKey: e.target.value }))
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() =>
                    setEnrollModal({
                      show: false,
                      subject: null,
                      enrollKey: "",
                      error: null,
                      loading: false,
                    })
                  }
                  className="px-3 py-1 border rounded-md"
                  disabled={enrollModal.loading}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setEnrollModal((m) => ({
                      ...m,
                      loading: true,
                      error: null,
                    }));
                    try {
                      await api.post(
                        `/subjects/${enrollModal.subject._id}/enroll`,
                        { enrollKey: enrollModal.enrollKey },
                        token
                          ? { headers: { Authorization: `Bearer ${token}` } }
                          : undefined,
                      );
                      // go to course after successful enroll
                      navigate(`/courses/${enrollModal.subject._id}`);
                      setEnrollModal({
                        show: false,
                        subject: null,
                        enrollKey: "",
                        error: null,
                        loading: false,
                      });
                    } catch (err) {
                      setEnrollModal((m) => ({
                        ...m,
                        loading: false,
                        error:
                          err?.response?.data?.message ||
                          err.message ||
                          "Enroll failed",
                      }));
                    }
                  }}
                  className="px-3 py-1 bg-black text-white rounded-md"
                  disabled={enrollModal.loading}
                >
                  {enrollModal.loading ? "Enrolling..." : "Enroll"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
