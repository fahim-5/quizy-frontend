import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api from "../services/api";

export default function Teachers() {
  // keep full list for searching, but display max 20
  const [teachersAll, setTeachersAll] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [modalTeacher, setModalTeacher] = useState(null);
  const [centerPrompt, setCenterPrompt] = useState(null);
  const [coursesByTeacher, setCoursesByTeacher] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = useAuth();
  const [redirecting, setRedirecting] = useState(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/teachers");
        const all = res?.data?.data || res?.data || [];
        const t = Array.isArray(all) ? all : [];
        // keep full list for searching
        setTeachersAll(t);
        setFiltered(t);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load teachers",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const term = (q || "").trim().toLowerCase();
    if (!term) return setFiltered(teachersAll);
    setFiltered(
      teachersAll.filter((t) => {
        // filter only by teacher name
        return (t.name || "").toLowerCase().includes(term);
      }),
    );
  }, [q, teachersAll]);

  const toggle = async (id) => {
    // keep for backward-compat but open modal instead
    setModalTeacher(id);
    if (coursesByTeacher[id]) return;
    try {
      const r = await api.get(`/subjects?teacherId=${id}`);
      setCoursesByTeacher((s) => ({
        ...s,
        [id]: r?.data?.subjects || r?.data || [],
      }));
    } catch (err) {
      setCoursesByTeacher((s) => ({ ...s, [id]: [] }));
    }
  };

  const closeModal = () => setModalTeacher(null);

  const handleViewCourse = (c) => {
    const user = auth?.user || null;
    if (user) {
      // navigate directly
      navigate(`/teacher/courses/${c._id || c.id}`);
      return;
    }
    // hide modal and show center prompt then redirect after 5s
    setModalTeacher(null);
    setCenterPrompt("Please login to view this course — redirecting...");
    setTimeout(() => {
      setCenterPrompt(null);
      navigate("/login");
    }, 5000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Teachers</h2>
      <p className="text-sm text-gray-600 mb-4">
        Browse instructors on the platform.
      </p>

      <div className="mb-4">
        <input
          aria-label="Search teachers"
          placeholder="Search by name, institution or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full md:w-1/2 border px-3 py-2 rounded-md"
        />
      </div>

      {loading && <div className="text-gray-600">Loading teachers...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.slice(0, 20).map((t) => (
          <div
            key={t._id || t.id}
            onClick={() => toggle(t._id || t.id)}
            className="p-4 bg-white rounded-lg border hover:shadow cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-black">
                  {t.name || t.identifier || "—"}
                </div>
                <div className="text-sm text-gray-600">
                  {t.institution || "—"}
                </div>
                {t.email && (
                  <div className="text-xs text-gray-500 mt-1">{t.email}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && !loading && (
        <div className="mt-6 text-sm text-gray-600">No teachers found.</div>
      )}
      {redirecting && (
        <div className="fixed bottom-6 right-6 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded shadow">
          <div className="text-sm text-black">
            Please login to view this course — redirecting to login...
          </div>
        </div>
      )}
      {/* Modal for teacher courses */}
      {modalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => closeModal()}
          />
          <div className="relative bg-white rounded-lg w-full max-w-2xl mx-4 p-6 shadow-lg z-50">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => closeModal()}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-3">Courses</h3>
            <div className="space-y-3 max-h-80 overflow-auto">
              {(coursesByTeacher[modalTeacher] || []).length === 0 ? (
                <div className="text-sm text-gray-500">No courses found.</div>
              ) : (
                (coursesByTeacher[modalTeacher] || []).map((c) => (
                  <div
                    key={c._id || c.id}
                    className="p-3 border rounded-md flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-black">
                        {c.name || c.title || c.code}
                      </div>
                      <div className="text-xs text-gray-500">
                        {c.code || ""}
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewCourse(c)}
                      className="text-sm px-3 py-1 bg-black text-white rounded-md"
                    >
                      View
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Center prompt when redirecting user to login */}
      {centerPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative bg-white p-6 rounded shadow text-center max-w-sm mx-4">
            <div className="text-sm text-black">{centerPrompt}</div>
          </div>
        </div>
      )}
    </div>
  );
}
