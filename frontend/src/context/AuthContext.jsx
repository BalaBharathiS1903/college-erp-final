import { createContext, useContext, useState, useEffect } from "react";
import { validateLogin } from "../utils/userStore";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || "10000", 10); // Configurable timeout

// Allowlist of trusted origins — prevents SSRF (CWE-918)
const ALLOWED_ORIGINS = (() => {
  const defaults = ["http://localhost:8080", "https://bhc-erp-backend.onrender.com"];
  try {
    const base = new URL(API_BASE).origin;
    return defaults.includes(base) ? defaults : [...defaults, base];
  } catch {
    return defaults;
  }
})();

function assertTrustedURL(url) {
  try {
    const origin = new URL(url).origin;
    if (!ALLOWED_ORIGINS.includes(origin)) {
      throw new Error(`Blocked request to untrusted origin: ${origin}`);
    }
  } catch (e) {
    if (e.message.startsWith("Blocked")) throw e;
    // relative URLs are always safe
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

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
    try {
      const loginURL = `${API_BASE}/api/auth/login`;
      assertTrustedURL(loginURL);
      const res = await fetch(loginURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
        signal: AbortSignal.timeout(API_TIMEOUT),
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

      let msg = "Invalid credentials";
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch (e) {
        // Ignore non-JSON error bodies.
      }
      throw new Error(msg);

    } catch (err) {
      const isNetworkError =
        err.name === "TimeoutError" || err.name === "AbortError" ||
        err.name === "TypeError"    || err.message === "Failed to fetch";
      if (isNetworkError) {
        console.warn("⚠️ Backend unavailable - Using offline mode (localStorage)");
        const found = validateLogin(username, password, role);
        if (!found) throw new Error("Invalid credentials for offline mode.");
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
    // Reject absolute URLs that could bypass the trusted origin check
    if (/^https?:\/\//i.test(url)) {
      assertTrustedURL(url);
    }
    const fullURL = `${API_BASE}${url}`;
    assertTrustedURL(fullURL);
    return fetch(fullURL, {
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
