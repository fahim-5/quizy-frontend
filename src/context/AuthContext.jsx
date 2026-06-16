import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("dev_user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem("dev_user", JSON.stringify(user));
      else localStorage.removeItem("dev_user");
    } catch (e) {}
  }, [user]);

  const login = (userData) => {
    setUser(userData || null);
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("dev_user");
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
