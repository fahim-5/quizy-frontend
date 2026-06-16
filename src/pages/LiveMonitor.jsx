import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";

export default function LiveMonitor() {
  const { id: quizId } = useParams();
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [announceText, setAnnounceText] = useState("");

  useEffect(() => {
    let mounted = true;
    let socket;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/quizzes/${quizId}/monitor`);
        if (!mounted) return;
        setData(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Fetch failed");
      } finally {
        setLoading(false);
      }
    };

    const setupSocket = () => {
      try {
        socket = io(window.location.origin, {
          transports: ["websocket"],
          withCredentials: true,
        });
        socket.on("connect", () => {
          socket.emit("monitor:join", quizId);
        });

        socket.on("participant:joined", (payload) => {
          setData((d) => ({
            ...d,
            participants: [...(d?.participants || []), payload.participant],
          }));
        });

        socket.on("answer:submitted", (payload) => {
          // refresh full monitor for correctness/simple approach
          fetchData();
        });

        socket.on("monitor:control", (payload) => {
          // refresh session state
          fetchData();
        });
      } catch (e) {
        // ignore
      }
    };

    fetchData();
    setupSocket();

    return () => {
      mounted = false;
      if (socket && socket.disconnect) socket.disconnect();
    };
  }, [quizId]);

  const sendControl = async (action) => {
    try {
      await api.post(`/quizzes/${quizId}/monitor/control`, { action });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Control failed");
    }
  };

  const sendAnnouncement = async () => {
    if (!announceText.trim()) return;
    try {
      await api.post(`/quizzes/${quizId}/monitor/control`, {
        action: "announce",
        message: announceText,
      });
      setAnnounceText("");
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Announce failed",
      );
    }
  };

  if (!user)
    return <div className="p-6">Please log in as teacher to view monitor.</div>;
  if (user.role !== "teacher")
    return <div className="p-6 text-red-600">Access denied</div>;

  return (
    <div className="p-6 bg-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Live Monitor</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-3">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left: participants */}
        <div className="col-span-1 border p-3 rounded">
          <h3 className="font-semibold">Participants</h3>
          <ul className="mt-2 space-y-2 max-h-96 overflow-auto">
            {data?.participants?.map((p) => (
              <li
                key={p._id}
                className="p-2 bg-gray-50 rounded flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">
                    {p.name || (p.user && p.user.name) || "Guest"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {p.status} • {new Date(p.joinedAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-sm text-gray-700">
                  {p.answers?.length || 0}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Center: stats */}
        <div className="col-span-2 border p-3 rounded">
          <h3 className="font-semibold">Live Question Results</h3>
          <div className="mt-3 space-y-3">
            {data?.stats && data.stats.length === 0 && (
              <div className="text-sm text-gray-500">No answers yet.</div>
            )}
            {data?.stats?.map((s) => (
              <div key={s.question._id} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{s.question.text}</div>
                    <div className="text-xs text-gray-500">
                      Total answers: {s.total}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{s.percentCorrect}% correct</div>
                    <div className="text-xs text-gray-500">
                      {s.correct} correct • {s.wrong} wrong
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  {s.perAnswers?.slice(0, 5).map((a, i) => (
                    <div key={i}>
                      {a.participant}: {a.answer} {a.correct ? "(✔)" : "(✖)"}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: controls */}
        <div className="col-span-1 border p-3 rounded">
          <h3 className="font-semibold">Controls</h3>
          <div className="mt-3 flex flex-col gap-2">
            <button
              onClick={() => sendControl("pause")}
              className="px-3 py-2 bg-yellow-400 rounded"
            >
              Pause Quiz
            </button>
            <button
              onClick={() => sendControl("resume")}
              className="px-3 py-2 bg-blue-400 rounded"
            >
              Resume Quiz
            </button>
            <button
              onClick={() => sendControl("end")}
              className="px-3 py-2 bg-red-600 text-white rounded"
            >
              End Quiz
            </button>

            <div className="mt-4">
              <label className="block text-sm font-medium">Announcement</label>
              <textarea
                value={announceText}
                onChange={(e) => setAnnounceText(e.target.value)}
                className="w-full border rounded p-2"
              />
              <button
                onClick={sendAnnouncement}
                className="mt-2 px-3 py-2 bg-black text-white rounded"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: individual answers */}
      <div className="mt-6 border p-3 rounded">
        <h3 className="font-semibold">Individual Answers</h3>
        <div className="mt-3 space-y-3 max-h-96 overflow-auto">
          {data?.participants?.map((p) => (
            <details key={p._id} className="p-2 bg-gray-50 rounded">
              <summary className="font-medium">
                {p.name || "Guest"} — {p.answers?.length || 0} answers
              </summary>
              <div className="mt-2 text-sm text-gray-700">
                {p.answers?.map((a, idx) => (
                  <div key={idx} className="py-1 border-b last:border-b-0">
                    <div className="text-xs text-gray-500">
                      Question: {a.question}
                    </div>
                    <div>
                      Answer: {a.answer}{" "}
                      {a.correct ? (
                        <span className="text-green-600">(Correct)</span>
                      ) : (
                        <span className="text-red-600">(Wrong)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
