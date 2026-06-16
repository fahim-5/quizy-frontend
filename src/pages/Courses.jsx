import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function Courses() {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [onlyMyQuizzes, setOnlyMyQuizzes] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", enrollKey: "" });
  const [query, setQuery] = useState("");
  const [enrollModal, setEnrollModal] = useState({
    show: false,
    subject: null,
    enrollKey: "",
    error: null,
    loading: false,
  });
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!user) return;
    // Teachers should see only their courses by default; students see all
    if (user.role === "teacher") fetchSubjects(true);
    else fetchSubjects(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchSubjects = async (onlyMine = false) => {
    setLoading(true);
    setError(null);
    try {
      const url =
        onlyMine && user && user._id
          ? `/subjects?teacherId=${user._id}`
          : "/subjects";
      const res = await api.get(
        url,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );
      const list = (res && res.data && res.data.subjects) || [];
      setSubjects(list);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load subjects",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const filtered = subjects.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (s.name || "").toLowerCase().includes(q) ||
      (s.code || "").toLowerCase().includes(q)
    );
  });

  // if ?enrolled=true is present and user is a student, show only enrolled courses
  const params = new URLSearchParams(location.search);
  const showEnrolledOnly = params.get("enrolled") === "true";
  const visible =
    showEnrolledOnly && user && user.role === "student"
      ? filtered.filter((s) => s.isEnrolled)
      : filtered;

  return (
    <div className="bg-white min-h-screen p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Courses</h2>
        <div className="flex items-center gap-3">
          {user.role === "teacher" && (
            <button
              onClick={() => setShowCreate(true)}
              className="mr-2 px-3 py-1 bg-green-600 text-white rounded-md"
            >
              Add Course
            </button>
          )}
          <button
            onClick={() => fetchSubjects(user.role === "teacher")}
            className="mr-2 px-3 py-1 border rounded-md text-black"
          >
            Refresh
          </button>
          {/* Back button removed per UX request */}
        </div>
      </div>

      <div className="mb-4">
        <input
          placeholder="Search courses by name or code..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full md:w-1/2 border px-3 py-2 rounded-md"
        />
      </div>

      {loading && <p className="text-black">Loading courses...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="overflow-x-auto bg-white border rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instructor
              </th>
              {user && user.role === "teacher" && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enroll Key
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visible.map((s) => {
              const isOwner =
                user &&
                user.role === "teacher" &&
                (s.createdBy?._id === user._id ||
                  s.createdBy?.identifier === user.identifier ||
                  s.createdBy?.email === user.email);

              return (
                <tr key={s._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {s.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    {s.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span>
                        {s.createdBy?.name || s.createdBy?.identifier || "—"}
                      </span>
                    </div>
                  </td>
                  {user && user.role === "teacher" && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {s.enrollKey}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                    <button
                      onClick={async () => {
                        // Teachers who own the course are treated as enrolled
                        if (isOwner) {
                          navigate(`/teacher/courses/${s._id}`);
                          return;
                        }

                        // fetch subject to check enrollment for others
                        try {
                          const res = await api.get(
                            `/subjects/${s._id}`,
                            token
                              ? {
                                  headers: { Authorization: `Bearer ${token}` },
                                }
                              : undefined,
                          );
                          const isEnrolled = res.data && res.data.isEnrolled;
                          if (isEnrolled) {
                            navigate(
                              user && user.role === "teacher"
                                ? `/teacher/courses/${s._id}`
                                : `/courses/${s._id}`,
                            );
                          } else {
                            setEnrollModal({
                              show: true,
                              subject: res.data.subject || s,
                              enrollKey: "",
                              error: null,
                              loading: false,
                            });
                          }
                        } catch (err) {
                          setEnrollModal({
                            show: true,
                            subject: s,
                            enrollKey: "",
                            error: null,
                            loading: false,
                          });
                        }
                      }}
                      className={`${
                        // If visiting the enrolled-only view as a student, show black view button
                        showEnrolledOnly && user && user.role === "student"
                          ? "text-sm px-2 py-1 bg-black text-white rounded-md"
                          : isOwner ||
                              s.isEnrolled ||
                              (user && user.role === "student" && !s.enrollKey)
                            ? "text-sm px-2 py-1 bg-green-600 text-white rounded-md"
                            : "text-sm px-2 py-1 border rounded-md"
                      }`}
                    >
                      View Course
                    </button>
                    {user && user.role === "teacher" && isOwner && (
                      <button
                        onClick={async () => {
                          const ok = window.confirm(
                            `Delete course "${s.name}"? This cannot be undone.`,
                          );
                          if (!ok) return;
                          try {
                            setDeleting(s._id);
                            await api.delete(
                              `/subjects/${s._id}`,
                              token
                                ? {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                : undefined,
                            );
                            setSubjects((prev) =>
                              prev.filter((x) => x._id !== s._id),
                            );
                          } catch (err) {
                            setError(
                              err?.response?.data?.message ||
                                err.message ||
                                "Delete failed",
                            );
                          } finally {
                            setDeleting(null);
                          }
                        }}
                        className="ml-2 text-sm px-2 py-1 bg-red-600 text-white rounded-md"
                        disabled={deleting === s._id}
                      >
                        {deleting === s._id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {subjects.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={user && user.role === "teacher" ? 5 : 4}
                  className="px-6 py-4 text-sm text-gray-500"
                >
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Course</h3>
            <div className="mb-3">
              <label className="block text-sm text-gray-700">Name</label>
              <input
                className="w-full border px-2 py-1 rounded-md"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm text-gray-700">Code</label>
              <input
                className="w-full border px-2 py-1 rounded-md"
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({ ...f, code: e.target.value }))
                }
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm text-gray-700">
                Enroll Key{" "}
                <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <input
                className="w-full border px-2 py-1 rounded-md"
                value={form.enrollKey}
                onChange={(e) =>
                  setForm((f) => ({ ...f, enrollKey: e.target.value }))
                }
              />
              <p className="text-xs text-gray-500 mt-1">
                If left empty the course will be openly joinable by students.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="px-3 py-1 border rounded-md"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!form.name || !form.code)
                    return setError("Name and code required");
                  setCreating(true);
                  setError(null);
                  try {
                    const payload = {
                      name: form.name,
                      code: form.code,
                    };
                    if (
                      form.enrollKey &&
                      String(form.enrollKey).trim() !== ""
                    ) {
                      payload.enrollKey = form.enrollKey;
                    }
                    const res = await api.post(
                      "/subjects",
                      payload,
                      token
                        ? { headers: { Authorization: `Bearer ${token}` } }
                        : undefined,
                    );
                    setShowCreate(false);
                    setForm({ name: "", code: "", enrollKey: "" });
                    // refresh list after creation
                    fetchSubjects(true);
                    // optionally navigate to the created course
                    if (res?.data?.subject?._id)
                      navigate(
                        `/teacher/courses/${res.data.subject._id}?mine=true`,
                      );
                  } catch (err) {
                    setError(
                      err?.response?.data?.message ||
                        err.message ||
                        "Create failed",
                    );
                  } finally {
                    setCreating(false);
                  }
                }}
                className="px-3 py-1 bg-black text-white rounded-md"
                disabled={creating}
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {enrollModal.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Enroll in {enrollModal.subject?.name}
            </h3>
            {enrollModal.subject && !enrollModal.subject.enrollKey ? (
              <p className="text-sm text-gray-600 mb-3">
                This course is open — click Join to enroll without a key.
              </p>
            ) : (
              <>
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
                      setEnrollModal((m) => ({
                        ...m,
                        enrollKey: e.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}
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
                  setEnrollModal((m) => ({ ...m, loading: true, error: null }));
                  try {
                    const body = {};
                    if (enrollModal.subject && enrollModal.subject.enrollKey) {
                      body.enrollKey = enrollModal.enrollKey;
                    }
                    await api.post(
                      `/subjects/${enrollModal.subject._id}/enroll`,
                      body,
                      token
                        ? { headers: { Authorization: `Bearer ${token}` } }
                        : undefined,
                    );
                    // go to course after successful enroll
                    navigate(
                      user && user.role === "teacher"
                        ? `/teacher/courses/${enrollModal.subject._id}`
                        : `/courses/${enrollModal.subject._id}`,
                    );
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
                {enrollModal.loading
                  ? "Enrolling..."
                  : enrollModal.subject && !enrollModal.subject.enrollKey
                    ? "Join"
                    : "Enroll"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
