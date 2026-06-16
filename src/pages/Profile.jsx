import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBook,
  FaChalkboardTeacher,
  FaEnvelope,
  FaIdBadge,
  FaSchool,
  FaUserShield,
  FaSignOutAlt,
} from "react-icons/fa";

import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { logout, login } = useContext(AuthContext);

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", institution: "" });
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/users/me");
      setProfile(res.data.data || res.data);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Failed to load profile",
      );
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    setForm({
      name: profile.name || "",
      email: profile.email || "",
      institution: profile.institution || "",
    });
    setSuccess(null);
    setError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setForm({ name: "", email: "", institution: "" });
    setError(null);
    setSuccess(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.put("/users/me", form);
      const updated = res.data.data || res.data;
      setProfile(updated);
      // update auth context if available
      login && login(updated, localStorage.getItem("token"));
      setSuccess("Profile updated");
      setIsEditing(false);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-red-100 rounded-2xl shadow-sm p-6 max-w-md w-full text-center">
          <h2 className="text-lg font-semibold text-red-500 mb-2">
            Something went wrong
          </h2>

          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // Empty State
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        No profile data found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            {profile && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {profile.name || profile.identifier}
                </h2>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 transition"
            >
              <FaArrowLeft size={13} />
              Back
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
          {/* Soft Top */}
          <div className="h-24 bg-gray-100" />

          <div className="px-6 pb-8">
            {/* Minimal user header — avatar and extra details removed for simplicity */}
            <div className="pt-6">
              {isEditing ? (
                <div className="space-y-2 max-w-md">
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="Full name"
                    className="w-full text-lg font-medium border-b px-2 py-1 focus:outline-none"
                  />

                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <FaEnvelope />
                    <input
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="Email"
                      className="w-full border-b px-2 py-1 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div />
              )}
            </div>

            {/* messages */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded">
                {success}
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {/* Identifier */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center">
                    <FaIdBadge />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      Identifier
                    </p>

                    <h3 className="font-medium text-gray-700">
                      {profile.identifier}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Institution */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 text-gray-600 flex items-center justify-center">
                    <FaSchool />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      Institution
                    </p>

                    {isEditing ? (
                      <input
                        value={form.institution}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            institution: e.target.value,
                          }))
                        }
                        className="w-full border px-2 py-1 rounded mt-2"
                      />
                    ) : (
                      <h3 className="font-medium text-gray-700">
                        {profile.institution || "Not Added"}
                      </h3>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                <p className="text-xs text-gray-400 uppercase mb-2">
                  Account Status
                </p>

                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    profile.isActive
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {profile.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Joined */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
                <p className="text-xs text-gray-400 uppercase mb-2">
                  Joined On
                </p>

                <h3 className="font-medium text-gray-700">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </h3>
              </div>
            </div>

            {/* Actions (edit only) */}
            <div className="flex flex-wrap gap-4 mt-8">
              {isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-green-600 text-white hover:bg-green-700 transition"
                  >
                    Save
                  </button>

                  <button
                    onClick={cancelEdit}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-gray-200 bg-white hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
