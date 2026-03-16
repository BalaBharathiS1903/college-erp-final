import { createContext, useContext, useState, useEffect } from "react";
import { validateLogin } from "../utils/userStore";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
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

  const login = async (username, password, role) => {
    // First try backend
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("erp_token",    data.token);
        localStorage.setItem("erp_role",     data.role);
        localStorage.setItem("erp_username", data.username);
        localStorage.setItem("erp_name",     data.name || data.username);
        setUser({ token: data.token, role: data.role, username: data.username, name: data.name || data.username });
        return data.role;
      }

      // Backend returned error (wrong password)
      let msg = "Invalid credentials";
      try { const err = await res.json(); msg = err.message || msg; } catch(e) {}
      throw new Error(msg);

    } catch (err) {
      // Backend not available — validate against local userStore
      if (err.name === "AbortError" || err.message === "Failed to fetch" || err.name === "TypeError") {
        // Local auth fallback
        const found = validateLogin(username, password, role);
        if (!found) {
          throw new Error("Invalid username or password.");
        }
        const mockToken = `local_token_${Date.now()}`;
        localStorage.setItem("erp_token",    mockToken);
        localStorage.setItem("erp_role",     found.role);
        localStorage.setItem("erp_username", found.username);
        localStorage.setItem("erp_name",     found.name);
        setUser({ token: mockToken, role: found.role, username: found.username, name: found.name });
        return found.role;
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("erp_role");
    localStorage.removeItem("erp_username");
    localStorage.removeItem("erp_name");
    setUser(null);
  };

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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
