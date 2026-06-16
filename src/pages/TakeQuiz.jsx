import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Timer from "../components/Timer";

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [qRes, qsRes] = await Promise.all([
          api.get(`/quizzes/${id}`),
          api.get(`/questions/quiz/${id}`),
        ]);
        setQuiz(qRes.data.quiz || qRes.data);
        setQuestions(qsRes.data.questions || qsRes.data.questions || []);
      } catch (err) {
        // If the quiz requires a join code, prompt the user
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || "";
        if (status === 403 && /join code/i.test(msg)) {
          // Try the reserved open code '1234' automatically first
          try {
            const [qRes, qsRes] = await Promise.all([
              api.get(`/quizzes/${id}?code=1234`),
              api.get(`/questions/quiz/${id}`),
            ]);
            setQuiz(qRes.data.quiz || qRes.data);
            setQuestions(qsRes.data.questions || qsRes.data.questions || []);
            setError(null);
            return;
          } catch (e) {
            // Fall through to show join-code prompt
          }
          setError("This quiz requires a join code. Enter code to continue.");
          return;
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const [joinCode, setJoinCode] = useState("");

  const submitJoinCode = async () => {
    setLoading(true);
    setError(null);
    try {
      const [qRes, qsRes] = await Promise.all([
        api.get(`/quizzes/${id}?code=${encodeURIComponent(joinCode)}`),
        api.get(`/questions/quiz/${id}`),
      ]);
      setQuiz(qRes.data.quiz || qRes.data);
      setQuestions(qsRes.data.questions || qsRes.data.questions || []);
      setError(null);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async () => {
    const payload = {
      quiz: id,
      answers: Object.entries(answers)
        .filter(([k]) => k !== "__resultId")
        .map(([question, answerIndex]) => ({
          question,
          answerIndex: Number(answerIndex),
        })),
      resultId: answers.__resultId,
    };

    try {
      const guestName =
        location.state && location.state.guestName
          ? location.state.guestName
          : undefined;
      if (guestName) payload.guestName = guestName;
      const res = await api.post("/results", payload);
      const result = res.data.result || res.data;
      // Pass full result object so the Result page can render immediately
      navigate("/result", { state: { result } });
    } catch (err) {
      console.error(err);
    }
  };

  const scheduleSave = (newAnswers) => {
    // debounce autosave by 1s
    if (!newAnswers.__resultId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const resultId = newAnswers.__resultId;
        const payload = {
          answers: Object.entries(newAnswers)
            .filter(([k]) => k !== "__resultId")
            .map(([question, answerIndex]) => ({
              question,
              answerIndex: Number(answerIndex),
            })),
        };
        await api.put(`/results/${resultId}`, payload);
      } catch (e) {
        // ignore autosave errors
      }
    }, 1000);
  };

  const handleSelect = (questionId, optionIndex) => {
    setAnswers((a) => {
      const next = { ...a, [questionId]: optionIndex };
      scheduleSave(next);
      return next;
    });
  };

  const goTo = (idx) => {
    if (idx < 0) idx = 0;
    if (idx >= questions.length) idx = questions.length - 1;
    setCurrentIndex(idx);
  };

  const [canStart, setCanStart] = useState(false);
  const [countdownToStart, setCountdownToStart] = useState(null);
  const [started, setStarted] = useState(false);
  const [examSeconds, setExamSeconds] = useState(quiz?.timeLimit || 300);

  useEffect(() => {
    if (!quiz) return;
    const now = Date.now();
    if (quiz.startFrom) {
      const startAt = new Date(quiz.startFrom).getTime();
      if (now < startAt) {
        setCanStart(false);
        setCountdownToStart(Math.ceil((startAt - now) / 1000));
        return;
      }
    }
    setCanStart(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz]);

  // Start the quiz (create draft and begin exam timer)
  const startQuiz = async () => {
    try {
      setLoading(true);
      const guestName =
        location.state && location.state.guestName
          ? location.state.guestName
          : undefined;
      // If a draft resultId was provided (from lobby join), reuse it
      if (location.state && location.state.resultId) {
        setAnswers((a) => ({ ...a, __resultId: location.state.resultId }));
        setStarted(true);
        setExamSeconds(quiz?.timeLimit || 300);
        // set current index to 0
        setCurrentIndex(0);
      } else {
        const payload = { quiz: id };
        if (joinCode) payload.joinCode = joinCode;
        if (guestName) payload.guestName = guestName;
        const res = await api.post(`/results/start`, payload);
        const draft = res.data.result || res.data;
        if (draft && draft._id)
          setAnswers((a) => ({ ...a, __resultId: draft._id }));
        setStarted(true);
        setExamSeconds(quiz?.timeLimit || 300);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error("Failed to create draft result:", err);
      const status = err?.response?.status;
      // If server indicates quiz already taken, navigate to view the existing result
      if (status === 409 && err?.response?.data?.result) {
        const existing = err.response.data.result;
        // try to fetch populated result then navigate
        try {
          const r = await api.get(`/results/${existing._id}`);
          const full = r?.data?.result || r?.data;
          navigate("/result", { state: { result: full } });
          return;
        } catch (e) {
          navigate("/result", { state: { result: existing } });
          return;
        }
      }

      const msg =
        err?.response?.data?.message || err.message || "Cannot start quiz";
      setError(msg);
      // Do not redirect unauthenticated guests to login; show error only
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page take-quiz-page p-6">
      {error && (
        <div className="max-w-7xl mx-auto mb-4 p-3 bg-red-50 text-red-700 rounded">
          {error}
        </div>
      )}
      {/* Join code prompt */}
      {error && /join code/i.test(error) && (
        <div className="max-w-md mx-auto mb-6 p-4 bg-white border rounded">
          <label className="block text-sm font-medium text-black mb-2">
            Enter join code
          </label>
          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="flex-1 border rounded px-2 py-1"
              placeholder="Enter code provided by instructor"
            />
            <button
              onClick={submitJoinCode}
              className="px-3 py-1 bg-black text-white rounded"
            >
              Submit
            </button>
          </div>
        </div>
      )}
      {/* Header with title, progress and timer/submit */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{quiz?.title || "Quiz"}</h2>
            <div className="mt-2 flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {Object.keys(answers).filter((k) => k !== "__resultId").length}{" "}
                of {questions.length} answered
              </div>
              <div className="w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 bg-blue-700"
                  style={{
                    width: `${questions.length ? (Object.keys(answers).filter((k) => k !== "__resultId").length / questions.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div>
              {!started && countdownToStart ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">Opens in</div>
                  <Timer
                    initialSeconds={countdownToStart}
                    onExpire={() => setCanStart(true)}
                  />
                </div>
              ) : !started ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">Ready to start</div>
                  <button
                    onClick={startQuiz}
                    className="px-4 py-2 bg-blue-900 text-white rounded shadow"
                    disabled={!canStart || loading}
                  >
                    Start Quiz
                  </button>
                </div>
              ) : (
                <Timer initialSeconds={examSeconds} onExpire={submitAnswers} />
              )}
            </div>

            {started && (
              <button
                onClick={submitAnswers}
                className="px-4 py-2 bg-black text-white rounded"
              >
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>

      {started && (
        <div className="space-y-6">
          {/* Top bar: question counter, timer, tentative points */}
          <div className="bg-white rounded shadow p-4 flex items-center justify-between">
            <div className="font-medium">
              Q{currentIndex + 1}/{questions.length}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Points:{" "}
                {questions.reduce((acc, q) => {
                  const ans = answers[q._id];
                  if (
                    typeof ans !== "undefined" &&
                    typeof q.correctIndex !== "undefined"
                  ) {
                    return (
                      acc +
                      (Number(ans) === Number(q.correctIndex)
                        ? q.points || 0
                        : 0)
                    );
                  }
                  return acc;
                }, 0)}
              </div>
              <div>
                <Timer initialSeconds={examSeconds} onExpire={submitAnswers} />
              </div>
            </div>
          </div>

          {/* Main question card */}
          {questions[currentIndex] && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                    Question {currentIndex + 1}
                  </div>
                  <div className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                    {quiz?.category ||
                      questions[currentIndex].category ||
                      "General"}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {questions[currentIndex].points || 1} points
                </div>
              </div>

              <div className="mt-3 font-semibold text-gray-800">
                {questions[currentIndex].text}
              </div>

              <div className="mt-4 space-y-3">
                {(questions[currentIndex].options || []).map((opt, oi) => (
                  <label
                    key={oi}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-sm"
                  >
                    <input
                      type="radio"
                      name={questions[currentIndex]._id}
                      checked={answers[questions[currentIndex]._id] === oi}
                      onChange={() =>
                        handleSelect(questions[currentIndex]._id, oi)
                      }
                      className="h-4 w-4"
                    />
                    <div className="text-gray-700">{opt.text}</div>
                  </label>
                ))}
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  className="px-4 py-2 bg-gray-200 rounded"
                  onClick={() => goTo(currentIndex - 1)}
                  disabled={currentIndex === 0}
                >
                  Previous
                </button>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-gray-200 rounded"
                    onClick={() => goTo(currentIndex + 1)}
                    disabled={currentIndex === questions.length - 1}
                  >
                    Next
                  </button>
                  <button
                    onClick={submitAnswers}
                    className="px-4 py-2 bg-black text-white rounded"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Question palette */}
          <div className="bg-white rounded shadow p-3">
            <div className="flex flex-wrap gap-2">
              {questions.map((q, i) => {
                const answered = typeof answers[q._id] !== "undefined";
                return (
                  <button
                    key={q._id}
                    onClick={() => goTo(i)}
                    className={`w-10 h-10 rounded ${answered ? "bg-green-500 text-white" : "bg-gray-100"}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
