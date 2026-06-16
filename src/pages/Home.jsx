import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import QuizCard from "../components/QuizCard";
import api from "../services/api";
import teacherImg from "../assets/images/Teacher.png";
import studentImg from "../assets/images/Student.png";

const Home = () => {
  const auth = useAuth();
  const user = auth?.user || null;
  const token = auth?.token || null;
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [enrollKey, setEnrollKey] = useState("");
  const [subjectError, setSubjectError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const res = await api.get("/quizzes");
        setQuizzes(res.data.quizzes || res.data || []);
        // if teacher, also fetch subjects (courses)
        if (user && user.role === "teacher") {
          try {
            const sres = await api.get(
              "/subjects?mine=true",
              token
                ? { headers: { Authorization: `Bearer ${token}` } }
                : undefined,
            );
            setSubjects(sres.data.subjects || []);
          } catch (e) {
            setSubjects([]);
          }
        }
      } catch (err) {
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  // Guest view: allow unauthenticated visitors to see and start available quizzes
  if (!user) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col">
        <main className="flex-grow">
          <div className="max-w-6xl mx-auto px-6 py-20">
            {/* Hero */}
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Run quizzes. Track results. Simple.
              </h1>
              <p className="mt-4 text-gray-600">Please login to continue.</p>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => navigate("/login?role=teacher")}
                  className="bg-black text-white px-6 py-3 rounded-md font-medium"
                >
                  Teacher
                </button>
                <button
                  onClick={() => navigate("/login?role=student")}
                  className="border border-gray-300 text-black px-6 py-3 rounded-md font-medium hover:bg-gray-50"
                >
                  Student
                </button>
              </div>

              {/* Three step features */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-lg font-semibold">
                    1
                  </div>
                  <h4 className="mt-4 font-semibold">Create</h4>
                  <p className="text-sm text-gray-600">Build quiz in minutes</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-lg font-semibold">
                    2
                  </div>
                  <h4 className="mt-4 font-semibold">Share</h4>
                  <p className="text-sm text-gray-600">Send code to class</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-lg font-semibold">
                    3
                  </div>
                  <h4 className="mt-4 font-semibold">Play</h4>
                  <p className="text-sm text-gray-600">Get results instantly</p>
                </div>
              </div>

              {/* Teacher / Student boxes */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">For Teachers</h3>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                    <li>Create quizzes</li>
                    <li>Add questions</li>
                    <li>CSV reports</li>
                    <li>Auto-grading</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">For Students</h3>
                  <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                    <li>Timed quizzes</li>
                    <li>See score</li>
                    <li>Works on phone</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Teacher dashboard
  if (user.role === "teacher") {
    return (
      <div className="p-8 bg-white min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">Teacher Dashboard</h2>
          <div className="flex gap-2">
            <Link
              to="/teacher"
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Manage Quizzes
            </Link>
            {/* Create Quiz button removed to avoid duplication with Manage Quizzes */}
            <button
              onClick={() => setShowAddSubject(true)}
              className="border border-blue-600 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              Add Subject
            </button>
          </div>
        </div>

        {showAddSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Add Subject</h3>
                <button
                  className="text-gray-600"
                  onClick={() => {
                    setShowAddSubject(false);
                    setSubjectCode("");
                    setSubjectName("");
                    setEnrollKey("");
                    setSubjectError(null);
                  }}
                >
                  Close
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-black">
                    Subject Name
                  </label>
                  <input
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black">
                    Subject Code
                  </label>
                  <input
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black">
                    Enroll Key (6 digits)
                  </label>
                  <input
                    value={enrollKey}
                    onChange={(e) => setEnrollKey(e.target.value)}
                    maxLength={6}
                    className="w-full border border-gray-300 rounded-md px-2 py-1"
                  />
                </div>

                {subjectError && (
                  <div className="text-red-600">{subjectError}</div>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={async () => {
                      // validate
                      if (!subjectName || subjectName.trim() === "") {
                        setSubjectError("Subject name is required");
                        return;
                      }
                      if (!subjectCode || subjectCode.trim() === "") {
                        setSubjectError("Subject code is required");
                        return;
                      }
                      if (!/^\d{6}$/.test(enrollKey)) {
                        setSubjectError("Enroll key must be exactly 6 digits");
                        return;
                      }

                      try {
                        const payload = {
                          name: subjectName.trim(),
                          code: subjectCode.trim(),
                          enrollKey: enrollKey.trim(),
                        };
                        await api.post(
                          "/subjects",
                          payload,
                          token
                            ? { headers: { Authorization: `Bearer ${token}` } }
                            : undefined,
                        );
                        alert("Subject added");
                        setShowAddSubject(false);
                        setSubjectName("");
                        setSubjectCode("");
                        setEnrollKey("");
                        setSubjectError(null);
                      } catch (e) {
                        setSubjectError(
                          e?.response?.data?.message ||
                            "Failed to save subject",
                        );
                      }
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowAddSubject(false);
                      setSubjectCode("");
                      setEnrollKey("");
                      setSubjectError(null);
                    }}
                    className="border px-4 py-2 rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <span className="text-gray-600">Total Quizzes</span>
            <br />
            <span className="text-2xl font-bold text-black">
              {quizzes.length}
            </span>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <span className="text-gray-600">Active Students</span>
            <br />
            <span className="text-2xl font-bold text-black">—</span>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <span className="text-gray-600">Recent Results</span>
            <br />
            <span className="text-2xl font-bold text-black">—</span>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-black">
            Your Quizzes
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {loading ? (
              <div className="text-black">Loading...</div>
            ) : (
              quizzes.slice(0, 4).map((q) => (
                <div
                  key={q._id}
                  className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
                >
                  <h4 className="font-semibold text-black">{q.title}</h4>
                  <p className="text-sm text-gray-600">{q.description}</p>
                  <div className="text-xs text-gray-500 mt-2">
                    Owner: {q.createdBy?.name || user.name}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Link
                      to={`/teacher`}
                      className="border border-gray-300 text-black px-3 py-1 rounded-md text-sm hover:bg-gray-100 transition-colors"
                    >
                      Edit
                    </Link>
                    <button className="bg-black text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800 transition-colors">
                      View Results
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-black">
            Your Courses
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            {loading && <div className="text-black">Loading...</div>}
            {!loading && subjects.length === 0 && (
              <div className="col-span-full p-6 bg-white rounded shadow">
                No courses yet.
              </div>
            )}
            {!loading &&
              subjects
                .filter(
                  (s) =>
                    String(s.createdBy?._id || s.createdBy || "") ===
                    String(user._id),
                )
                .slice(0, 4)
                .map((s) => (
                  <div key={s._id} className="p-4 bg-white rounded shadow">
                    <div className="text-sm text-gray-500">{s.code}</div>
                    <div className="font-semibold text-black">{s.name}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      Enroll key: {s.enrollKey || "—"}
                    </div>
                    {s.createdBy && (
                      <div className="text-xs text-gray-500 mt-2">
                        Owner: {s.createdBy.name || s.createdBy.identifier}
                      </div>
                    )}
                    <div className="mt-3">
                      <Link
                        to={`/teacher/courses/${s._id}`}
                        className="text-sm px-3 py-1 border rounded"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    );
  }

  // Student dashboard
  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Available Quizzes</h2>
        <div className="text-black">
          Welcome, <strong>{user.name || user.identifier || user._id}</strong>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-black">Loading quizzes...</div>
        ) : (
          quizzes.map((q) => (
            <QuizCard
              key={q._id}
              title={q.title}
              description={q.description}
              onStart={() => navigate(`/quiz/${q._id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Home;
