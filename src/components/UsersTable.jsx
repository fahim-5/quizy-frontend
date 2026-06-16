import React from "react";

export default function UsersTable({
  users = [],
  onPromote = () => {},
  onDeactivate = () => {},
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recent Users</h3>
      </div>
      {users.length === 0 ? (
        <p className="text-gray-500">No users found.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((u) => (
            <li
              key={u._id || u.id}
              className="p-3 bg-white rounded shadow flex justify-between items-center"
            >
              <div>
                <div className="font-medium">
                  {u.name || u.username || u.email}
                </div>
                <div className="text-sm text-gray-500">{u.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {u.role || "user"}
                </span>
                <button
                  className="text-sm text-blue-600"
                  onClick={() => onPromote(u)}
                >
                  Promote
                </button>
                <button
                  className="text-sm text-red-600"
                  onClick={() => onDeactivate(u)}
                >
                  Deactivate
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
