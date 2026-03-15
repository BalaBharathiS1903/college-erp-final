import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { username, role, token, name }
  const [loading, setLoading] = useState(true);   // true while checking stored token

  // ── Restore session from localStorage on mount ──────────────
  useEffect(() => {
    const stored = localStorage.getItem("erp_token");
    const role   = localStorage.getItem("erp_role");
    const uname  = localStorage.getItem("erp_username");
    const dname  = localStorage.getItem("erp_name");
    if (stored && role && uname) {
      setUser({ token: stored, role, username: uname, name: dname || uname });
    }
    setLoading(false);
  }, []);

  // ── Login ────────────────────────────────────────────────────
  const login = async (username, password, role) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      if (!res.ok) {
        let msg = "Invalid credentials";
        try { const err = await res.json(); msg = err.message || msg; } catch(e) {}
        throw new Error(msg);
      }

      const data = await res.json();   // { token, role, username, name }
      localStorage.setItem("erp_token",    data.token);
      localStorage.setItem("erp_role",     data.role);
      localStorage.setItem("erp_username", data.username);
      localStorage.setItem("erp_name",     data.name || data.username);
      setUser({ token: data.token, role: data.role, username: data.username, name: data.name || data.username });
      return data.role;
    } catch(err) {
      console.warn("Backend fetch failed. Using local mock login for demo purposes.", err);
      // Fallback local mock login for Vercel Demo
      let mockName = username;
      if (role === "ADMIN") mockName = "System Administrator";
      if (role === "STAFF") mockName = "Professor";
      if (role === "STUDENT") mockName = "Arjun Selvan";
      
      const mockToken = "mock_jwt_token_12345";
      localStorage.setItem("erp_token", mockToken);
      localStorage.setItem("erp_role", role);
      localStorage.setItem("erp_username", username);
      localStorage.setItem("erp_name", mockName);
      setUser({ token: mockToken, role, username, name: mockName });
      return role;
    }
  };

  // ── Logout ───────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_role");
    localStorage.removeItem("erp_username");
    localStorage.removeItem("erp_name");
    setUser(null);
  };

  // ── Authenticated fetch helper ───────────────────────────────
  const authFetch = (url, options = {}) => {
    return fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
        ...(options.headers || {}),
      },
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
