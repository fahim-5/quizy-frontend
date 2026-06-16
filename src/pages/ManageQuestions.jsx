import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function QuestionForm({ onSubmit, initial = null }) {
  const [text, setText] = useState(initial?.text || "");
  const [type, setType] = useState(initial?.type || "mcq");
  const [options, setOptions] = useState(
    initial?.options || [{ text: "" }, { text: "" }],
  );
  const [correctIndex, setCorrectIndex] = useState(
    initial?.correctIndex !== undefined ? initial.correctIndex : null,
  );
  const [answerText, setAnswerText] = useState(initial?.answerText || "");
  const [points, setPoints] = useState(initial?.points ?? 1);
  const [extraTime, setExtraTime] = useState(initial?.extraTime ?? 0);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (initial) {
      setText(initial.text || "");
      setType(initial.type || "mcq");
      setOptions(initial.options || [{ text: "" }, { text: "" }]);
      setCorrectIndex(
        initial.correctIndex !== undefined ? initial.correctIndex : null,
      );
      setAnswerText(initial.answerText || "");
      setPoints(initial.points ?? 1);
      setExtraTime(initial.extraTime ?? 0);
      setValidationError(null);
    }
  }, [initial]);

  const updateOption = (idx, value) => {
    setOptions((o) => {
      const copy = [...o];
      copy[idx] = { text: value };
      return copy;
    });
  };

  const addOption = () => setOptions((o) => [...o, { text: "" }]);
  const removeOption = (idx) =>
    setOptions((o) => o.filter((_, i) => i !== idx));

  const submit = (e) => {
    e && e.preventDefault();
    // Validation based on type
    if (type === "mcq") {
      const filledOptions = options.map((o) => (o.text || "").trim());
      if (
        filledOptions.length < 2 ||
        filledOptions.filter(Boolean).length < 2
      ) {
        setValidationError("Please provide at least two options with text.");
        return;
      }
      if (correctIndex === null || correctIndex === undefined) {
        setValidationError("Please select the correct answer.");
        return;
      }
    } else if (type === "tf") {
      if (correctIndex === null || correctIndex === undefined) {
        setValidationError(
          "Please select True or False as the correct answer.",
        );
        return;
      }
    }

    if (Number(points) < 1 || Number(points) > 100) {
      setValidationError("Points must be between 1 and 100.");
      return;
    }
    if (Number(extraTime) < 0) {
      setValidationError("Extra time must be 0 or a positive number.");
      return;
    }

    setValidationError(null);
    const payload = {
      text,
      type,
      points: Number(points),
    };
    if (extraTime) payload.extraTime = Number(extraTime);
    if (type === "mcq") {
      payload.options = options;
      payload.correctIndex = Number(correctIndex);
    } else if (type === "tf") {
      // ensure options reflect TF if not present
      payload.options =
        options && options.length >= 2
          ? options
          : [{ text: "False" }, { text: "True" }];
      payload.correctIndex = Number(correctIndex);
    }

    onSubmit(payload);
    setText("");
    setType("mcq");
    setOptions([{ text: "" }, { text: "" }]);
    setCorrectIndex(null);
    setAnswerText("");
    setPoints(1);
    setExtraTime(0);
  };

  return (
    <form
      onSubmit={submit}
      className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-3"
    >
      <div>
        <label className="block text-sm font-medium text-black">Question</label>
        <textarea
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-2 py-1 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-black">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-2 py-1"
        >
          <option value="mcq">Multiple Choice (MCQ)</option>
          <option value="tf">True / False</option>
        </select>

        {type === "mcq" && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-black">
              Options
            </label>
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center mt-2">
                <input
                  type="radio"
                  name="correct"
                  checked={correctIndex !== null && Number(correctIndex) === i}
                  onChange={() => setCorrectIndex(i)}
                  className="text-black"
                />
                <input
                  value={opt.text}
                  onChange={(e) => updateOption(i, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-2 py-1 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => removeOption(i)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <div className="mt-2">
              <button
                type="button"
                onClick={addOption}
                className="text-black hover:text-gray-700 underline"
              >
                Add option
              </button>
            </div>
          </div>
        )}

        {type === "tf" && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-black">
              Correct Answer
            </label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={Number(correctIndex) === 0}
                  onChange={() => setCorrectIndex(0)}
                />{" "}
                False
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={Number(correctIndex) === 1}
                  onChange={() => setCorrectIndex(1)}
                />{" "}
                True
              </label>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-black">Points</label>
          <input
            type="number"
            value={points}
            min={1}
            max={100}
            onChange={(e) => setPoints(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black">
            Extra time (seconds)
          </label>
          <input
            type="number"
            value={extraTime}
            min={0}
            onChange={(e) => setExtraTime(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-2 py-1 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <div>
          {validationError && (
            <div className="text-red-600 mb-2">{validationError}</div>
          )}
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Save Question
          </button>
        </div>
      </div>
    </form>
  );
}

export default function ManageQuestions() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [quizRes, qRes] = await Promise.allSettled([
        api.get(`/quizzes/${quizId}`),
        api.get(`/questions/quiz/${quizId}`),
      ]);
      if (quizRes.status === "fulfilled")
        setQuiz(quizRes.value.data.quiz || quizRes.value.data);
      if (qRes.status === "fulfilled")
        setQuestions(qRes.value.data.questions || qRes.value.data);
    } catch (err) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (payload) => {
    try {
      setLoading(true);
      const body = { ...payload, quiz: quizId };
      const res = await api.post(`/questions`, body);
      // Refresh quiz and questions so quiz.timeLimit reflects extraTime changes
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async (qid, payload) => {
    try {
      setLoading(true);
      await api.put(`/questions/${qid}`, payload);
      // Optimistic: refetch list
      await fetchData();
      setEditing(null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (qid) => {
    if (!confirm("Delete this question?")) return;
    try {
      setLoading(true);
      await api.delete(`/questions/${qid}`);
      // Refresh quiz and questions so quiz.timeLimit reflects removed extraTime
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <div className="p-6 text-black bg-white min-h-screen">
        Please log in to manage questions.
      </div>
    );
  if (user.role !== "teacher")
    return (
      <div className="p-6 text-red-600 bg-white min-h-screen">
        Access denied - teacher only.
      </div>
    );

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Manage Questions</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-700 hover:text-black"
        >
          Back
        </button>
      </div>

      {loading && <p className="text-black">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-black">Quiz</h3>
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm mt-2">
          <div className="font-medium text-black">
            Title: {quiz?.title ?? "Untitled Quiz"}
          </div>
          <div className="text-sm text-gray-700 mt-1">
            Duration:{" "}
            {typeof quiz?.timeLimit !== "undefined" ? quiz.timeLimit : 0}s
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-black">
            Add New Question
          </h3>
          <QuestionForm onSubmit={createQuestion} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-black">Questions</h3>
          {questions.length === 0 ? (
            <p className="text-gray-700">No questions yet.</p>
          ) : (
            <ul className="space-y-3">
              {questions.map((q) => (
                <li
                  key={q._id || q.id}
                  className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  {editing &&
                  (editing._id || editing.id) === (q._id || q.id) ? (
                    <div>
                      <QuestionForm
                        initial={editing}
                        onSubmit={(data) =>
                          updateQuestion(editing._id || editing.id, data)
                        }
                      />
                      <div className="mt-2">
                        <button
                          onClick={() => setEditing(null)}
                          className="text-sm text-gray-700 hover:text-black"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-black">{q.text}</div>
                        <div className="text-sm text-gray-700 mt-1">
                          <div className="text-xs text-gray-500">
                            Type: {q.type || "mcq"}
                          </div>
                          {q.type === "mcq" &&
                            q.options?.map((o, i) => (
                              <div key={i}>
                                {i + 1}. {o.text}{" "}
                                {q.correctIndex === i && (
                                  <span className="text-green-600">
                                    (Correct)
                                  </span>
                                )}
                              </div>
                            ))}
                          {q.type === "tf" && (
                            <div>
                              Correct: {q.correctIndex === 1 ? "True" : "False"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 ml-4">
                        <div className="text-sm text-gray-700">
                          Points: {q.points ?? 1}
                        </div>
                        {q.extraTime ? (
                          <div className="text-sm text-gray-700">
                            Extra time: {q.extraTime}s
                          </div>
                        ) : null}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditing(q)}
                            className="text-black hover:text-gray-700 text-sm underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteQuestion(q._id || q.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Editing form is rendered inline inside the list item */}
        </div>
      </div>
    </div>
  );
}
