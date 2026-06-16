import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

export default function Settings() {
  const { user, login, logout } = useAuth() || {};
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    institution: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/users/me");
        const data = res.data.data || res.data;
        setForm({
          name: data.name || "",
          email: data.email || "",
          institution: data.institution || "",
        });
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load profile",
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSaveUpdate = async () => {
    if (!user) return navigate("/login");
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // If user requested a password change, verify current password first
      if (newPassword && newPassword.length > 0) {
        try {
          await api.put(`/users/${user._id}/password`, {
            currentPassword,
            newPassword,
          });
          setSuccess("Password updated");
          setCurrentPassword("");
          setNewPassword("");
        } catch (err) {
          // On wrong current password (or other failure), log the user out as requested
          logout && logout();
          navigate("/login");
          return;
        }
      }

      // Update profile (name/email/institution) without email verification
      const res = await api.put(`/users/${user._id}`, form);
      const updated = res.data.data || res.data;
      login && login(updated, localStorage.getItem("token"));
      setSuccess("Profile updated");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const confirmDeleteAccount = async () => {
    if (!user) return;
    setDeleting(true);
    setError(null);
    try {
      await api.delete(`/users/me`, {
        data: { currentPassword: deletePassword },
      });
      // successful deletion: logout and redirect to home/login
      logout && logout();
      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Delete failed");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeletePassword("");
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
        {error && <div className="mb-3 text-red-600">{error}</div>}
        {success && <div className="mb-3 text-green-600">{success}</div>}
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-black">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border px-2 py-1 rounded"
            />
          </div>
          {/* Email editing removed — managed separately */}
          <div>
            <label className="block text-sm font-medium text-black">
              Institution
            </label>
            <input
              value={form.institution}
              onChange={(e) =>
                setForm((f) => ({ ...f, institution: e.target.value }))
              }
              className="w-full border px-2 py-1 rounded"
            />
          </div>

          <div className="mt-4 p-4 border rounded">
            <h3 className="font-medium mb-2">Change Password</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-black">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-black">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border px-2 py-1 rounded"
                />
              </div>
              {/* Inline success and quick login button shown below the new password field */}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveUpdate}
              disabled={loading}
              className="bg-black text-white px-4 py-2 rounded"
            >
              {loading ? "Saving..." : "Save Update"}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded ml-2 hover:bg-red-700"
            >
              Delete Account
            </button>
            <button
              onClick={() => navigate(-1)}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                <h3 className="text-lg font-semibold mb-2">Delete account</h3>
                <p className="text-sm mb-3">
                  Enter your current password to confirm account deletion. This
                  action cannot be undone.
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full border px-2 py-1 rounded mb-3"
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword("");
                    }}
                    className="px-3 py-1 border rounded"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteAccount}
                    className="px-3 py-1 bg-red-600 text-white rounded"
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
