import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function QuizEditor() {
  const navigate = useNavigate();
  const { id: existingId } = useParams();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [quiz, setQuiz] = useState(
    existingId
      ? null
      : {
          title: "",
          description: "",
          subject: "",
          grade: "",
          joinCode: "",
          timeLimit: 0,
          attemptsAllowed: "single",
          visibleFrom: "",
          startFrom: "",
        },
  );
  const [visibleImmediate, setVisibleImmediate] = useState(true);
  const [startImmediate, setStartImmediate] = useState(true);

  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    if (existingId) {
      fetchQuiz(existingId);
    }
    // fetch available subjects for assignment
    (async () => {
      try {
        // If current user is a teacher, only fetch their subjects to prevent assigning quizzes to other teachers' courses
        const url =
          user && user.role === "teacher"
            ? `/subjects?teacherId=${user._id}`
            : "/subjects";
        const res = await api.get(
          url,
          token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
        );
        setSubjects(res.data.subjects || []);
      } catch (e) {
        setSubjects([]);
      }
    })();
    // if a subject id is provided via query param (from course page), preselect it
    const params = new URLSearchParams(location.search);
    const preSub = params.get("subject");
    if (preSub && !existingId) {
      setQuiz((q) => ({ ...q, subject: preSub }));
    }
    // default immediacy when creating a new quiz
    if (!existingId) {
      setVisibleImmediate(true);
      setStartImmediate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingId]);

  const fetchQuiz = async (qid) => {
    setLoading(true);
    try {
      const res = await api.get(`/quizzes/${qid}`);
      const q = res.data.quiz;
      // normalize timeLimit to minutes for editor state (backend stores seconds)
      const minutes = q && q.timeLimit ? Math.round(q.timeLimit / 60) : 0;
      setQuiz({ ...q, timeLimit: minutes });
      // set immediacy flags based on existing values
      setVisibleImmediate(!q?.visibleFrom);
      setStartImmediate(!q?.startFrom);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  function toLocalInput(iso) {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - offset * 60000);
      return local.toISOString().slice(0, 16);
    } catch (e) {
      return "";
    }
  }

  const createQuiz = async () => {
    if (!quiz || !quiz.title || quiz.title.trim() === "") {
      setError("Title is required");
      return;
    }
    if (!quiz || !quiz.subject) {
      setError("Please assign a subject before creating the quiz");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        subject: quiz.subject,
        title: quiz.title,
        description: quiz.description,
        joinCode: quiz.joinCode || undefined,
        // frontend input is minutes; backend stores seconds — convert to seconds
        timeLimit: (Number(quiz.timeLimit) || 0) * 60,
        visibleFrom: quiz.visibleFrom
          ? new Date(quiz.visibleFrom).toISOString()
          : undefined,
        startFrom: quiz.startFrom
          ? new Date(quiz.startFrom).toISOString()
          : undefined,
        attemptsAllowed: quiz.attemptsAllowed || "single",
      };
      const res = await api.post("/quizzes", payload);
      setQuiz(res.data.quiz);
      setStep(2);
      // navigate to questions editor after creation
      navigate(`/teacher/quiz/${res.data.quiz._id}`);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!quiz || !quiz._id) return setError("No quiz to update");
    setLoading(true);
    try {
      const payload = {
        attemptsAllowed: quiz.attemptsAllowed,
        shuffleQuestions: !!quiz.shuffleQuestions,
        showAnswersAfterSubmission: !!quiz.showAnswersAfterSubmission,
        access: quiz.access || "public",
        joinCode: quiz.joinCode || undefined,
        allowedList: Array.isArray(quiz.allowedList)
          ? quiz.allowedList
          : typeof quiz.allowedList === "string"
            ? quiz.allowedList
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        // include scheduling updates when saving settings
        visibleFrom: quiz.visibleFrom
          ? new Date(quiz.visibleFrom).toISOString()
          : undefined,
        startFrom: quiz.startFrom
          ? new Date(quiz.startFrom).toISOString()
          : undefined,
      };
      const res = await api.put(`/quizzes/${quiz._id}`, payload);
      setQuiz(res.data.quiz);
      setStep(4);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const publish = async (makeLive) => {
    if (!quiz || !quiz._id) return setError("No quiz to publish");
    setLoading(true);
    try {
      const payload = {
        status: makeLive ? "live" : "draft",
        isActive: makeLive,
      };
      const res = await api.put(`/quizzes/${quiz._id}`, payload);
      setQuiz(res.data.quiz);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Publish failed");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch (err) {
      alert("Copy failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Quiz Editor</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-700"
          >
            Back
          </button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {step === 1 && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-3">Basic Info</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-black">
                Title
              </label>
              <input
                value={quiz?.title || ""}
                onChange={(e) =>
                  setQuiz((q) => ({ ...q, title: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">
                Subject
              </label>
              <select
                value={quiz?.subject || ""}
                onChange={(e) =>
                  setQuiz((q) => ({ ...q, subject: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} — {s.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-black">
                Description
              </label>
              <textarea
                value={quiz?.description || ""}
                onChange={(e) =>
                  setQuiz((q) => ({ ...q, description: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-2 py-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">
                Join Code (optional)
              </label>
              <input
                value={quiz?.joinCode || ""}
                onChange={(e) =>
                  setQuiz((q) => ({ ...q, joinCode: e.target.value }))
                }
                placeholder="e.g. 6-digit code or leave empty for public"
                className="w-full border border-gray-300 rounded-md px-2 py-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                If provided, students must supply this code to access the quiz.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-black">
                  Grade
                </label>
                <input
                  value={quiz?.grade || ""}
                  onChange={(e) =>
                    setQuiz((q) => ({ ...q, grade: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black">
                  Time limit (minutes)
                </label>
                <input
                  type="number"
                  value={quiz?.timeLimit || 0}
                  onChange={(e) =>
                    setQuiz((q) => ({
                      ...q,
                      // store minutes in state for the editor; will convert to seconds on submit
                      timeLimit: Number(e.target.value),
                    }))
                  }
                  placeholder="Enter time in minutes for quiz"
                  className="w-full border border-gray-300 rounded-md px-2 py-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-sm font-medium text-black">
                  Visible From (when students can see the quiz)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="datetime-local"
                    value={
                      quiz?.visibleFrom ? toLocalInput(quiz.visibleFrom) : ""
                    }
                    onChange={(e) =>
                      setQuiz((q) => ({
                        ...q,
                        visibleFrom: e.target.value || "",
                      }))
                    }
                    disabled={visibleImmediate}
                    className="w-full border border-gray-300 rounded-md px-2 py-1"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={visibleImmediate}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setVisibleImmediate(checked);
                        if (checked)
                          setQuiz((q) => ({ ...q, visibleFrom: "" }));
                      }}
                    />
                    <span>Immediate</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-black">
                  Start From (when students may start the quiz)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="datetime-local"
                    value={quiz?.startFrom ? toLocalInput(quiz.startFrom) : ""}
                    onChange={(e) =>
                      setQuiz((q) => ({
                        ...q,
                        startFrom: e.target.value || "",
                      }))
                    }
                    disabled={startImmediate}
                    className="w-full border border-gray-300 rounded-md px-2 py-1"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={startImmediate}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setStartImmediate(checked);
                        if (checked) setQuiz((q) => ({ ...q, startFrom: "" }));
                      }}
                    />
                    <span>Immediate</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Attempts allowed
              </label>
              <select
                value={quiz?.attemptsAllowed || "single"}
                onChange={(e) =>
                  setQuiz((q) => ({ ...q, attemptsAllowed: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="single">1 (single)</option>
                <option value="multiple">Multiple</option>
              </select>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={createQuiz}
                className="bg-black text-white px-4 py-2 rounded-md"
              >
                Create & Add Questions
              </button>
              <button
                onClick={() => navigate("/teacher")}
                className="border px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="font-semibold mb-3">Questions</h3>
          <p className="mb-3 text-gray-700">
            Use the Questions editor to add MCQ or True/False questions.
          </p>
          {quiz && quiz._id ? (
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/teacher/quiz/${quiz._id}`)}
                className="bg-black text-white px-4 py-2 rounded-md"
              >
                Open Questions Editor
              </button>
              <button
                onClick={() => setStep(3)}
                className="border ml-2 px-4 py-2 rounded-md"
              >
                I'm done — Next: Settings
              </button>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              Create the quiz first to add questions.
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-3">Settings</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Shuffle questions</div>
                <div className="text-sm text-gray-600">
                  Present questions in random order
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={!!quiz?.shuffleQuestions}
                  onChange={(e) =>
                    setQuiz((q) => ({
                      ...q,
                      shuffleQuestions: e.target.checked,
                    }))
                  }
                />
                <span className="slider"></span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Show answers after submission</div>
                <div className="text-sm text-gray-600">
                  Allow students to see correct answers
                </div>
              </div>
              <input
                type="checkbox"
                checked={!!quiz?.showAnswersAfterSubmission}
                onChange={(e) =>
                  setQuiz((q) => ({
                    ...q,
                    showAnswersAfterSubmission: e.target.checked,
                  }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black">
                Access
              </label>
              <select
                value={quiz?.access || "public"}
                onChange={(e) =>
                  setQuiz((q) => ({ ...q, access: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="public">Public (any student with code)</option>
                <option value="private">Private (specific class)</option>
              </select>
            </div>

            {quiz?.access === "private" && (
              <div>
                <label className="block text-sm font-medium text-black">
                  Allowed students / classes (comma separated emails or ids)
                </label>
                <input
                  value={
                    Array.isArray(quiz.allowedList)
                      ? quiz.allowedList.join(", ")
                      : quiz.allowedList || ""
                  }
                  onChange={(e) =>
                    setQuiz((q) => ({ ...q, allowedList: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-2 py-1"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Enter comma-separated identifiers; teachers can manage list
                  later.
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button
                onClick={saveSettings}
                className="bg-black text-white px-4 py-2 rounded-md"
              >
                Save & Continue
              </button>
              <button
                onClick={() => setStep(2)}
                className="border px-4 py-2 rounded-md"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="font-semibold mb-3">Publish</h3>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Quiz Code</div>
              <div className="font-mono text-lg">{quiz?.joinCode || "—"}</div>
              <div className="mt-2">
                <button
                  onClick={() => copyToClipboard(quiz?.joinCode || "")}
                  className="border px-3 py-1 rounded-md mr-2"
                >
                  Copy Code
                </button>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${window.location.origin}/join?code=${quiz?.joinCode}`,
                    )
                  }
                  className="border px-3 py-1 rounded-md"
                >
                  Copy Join Link
                </button>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => publish(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md"
                >
                  Set Live
                </button>
                <button
                  onClick={() => publish(false)}
                  className="border px-4 py-2 rounded-md"
                >
                  Save as Draft
                </button>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={() => navigate("/teacher")}
                className="px-4 py-2 rounded-md border"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
