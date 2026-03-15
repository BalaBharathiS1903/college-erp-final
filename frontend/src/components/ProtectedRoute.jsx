import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 *
 * Wraps any page that requires authentication.
 * Props:
 *   allowedRoles  — array of roles allowed, e.g. ["ADMIN"] or ["STAFF","ADMIN"]
 *                   pass null / omit to allow any authenticated user
 *   children      — the page component to render
 *
 * Behaviour:
 *   • Not logged in   → redirect to /login
 *   • Wrong role      → redirect to /unauthorized
 *   • Loading session → show spinner (prevents flash of login page)
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still checking localStorage / session
  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0a0a0f",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 44, height: 44,
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "#e84545",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 14px",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Loading…</div>
        </div>
      </div>
    );
  }

  // Not authenticated → go to login, preserve intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
