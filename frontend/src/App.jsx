import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// ── Lazy-load pages for code splitting ─────────────────────────
import LoginPage      from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Unauthorized   from "./pages/Unauthorized";
import { Analytics } from "@vercel/analytics/react";

// ── Root redirect: send logged-in users to their dashboard ─────
function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const map = { ADMIN: "/admin", STAFF: "/staff", STUDENT: "/student" };
  return <Navigate to={map[user.role] || "/login"} replace />;
}

// ── Login wrapper: injects navigation after login ──────────────
function LoginWrapper() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // If user came from a protected page, go back there after login
  const from = location.state?.from?.pathname;

  const handleLogin = async (username, password, role) => {
    const actualRole = await login(username, password, role);
    const dest = from || { ADMIN:"/admin", STAFF:"/staff", STUDENT:"/student" }[actualRole] || "/";
    navigate(dest, { replace: true });
  };

  // Pass handleLogin down as prop override so LoginPage can call it
  return <LoginPage onLogin={handleLogin} />;
}

// ── App ─────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Analytics />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"        element={<LoginWrapper />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Root → smart redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Admin — only ADMIN role */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Staff — STAFF or ADMIN */}
          <Route
            path="/staff/*"
            element={
              <ProtectedRoute allowedRoles={["STAFF", "ADMIN"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />

          {/* Student — STUDENT role */}
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
