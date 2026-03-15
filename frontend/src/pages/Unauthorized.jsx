import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const roleHome = {
    ADMIN:   "/admin",
    STAFF:   "/staff",
    STUDENT: "/student",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .unauth-root {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
          position: relative; overflow: hidden;
        }
        .bg-grid {
          position: fixed; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px);
          background-size: 60px 60px;
        }
        .card {
          position: relative; z-index: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px; padding: 56px 48px;
          text-align: center; max-width: 420px; width: 90%;
          backdrop-filter: blur(20px);
        }
        .icon { font-size: 64px; margin-bottom: 20px; }
        .code {
          font-family: 'Syne', sans-serif;
          font-size: 72px; font-weight: 800;
          color: #e84545; line-height: 1;
          margin-bottom: 8px;
        }
        .title {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 700; color: #fff;
          margin-bottom: 12px;
        }
        .desc { font-size: 14px; color: rgba(255,255,255,0.4); line-height: 1.6; margin-bottom: 32px; }
        .btn-row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .btn-primary {
          background: linear-gradient(135deg, #e84545, #f5a623);
          border: none; color: #fff; padding: 11px 22px;
          border-radius: 11px; font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(232,69,69,0.3); }
        .btn-ghost {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.5); padding: 11px 22px;
          border-radius: 11px; font-size: 14px; cursor: pointer; transition: all 0.2s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.08); color: #fff; }
      `}</style>

      <div className="unauth-root">
        <div className="bg-grid" />
        <div className="card">
          <div className="icon">🚫</div>
          <div className="code">403</div>
          <div className="title">Access Denied</div>
          <p className="desc">
            You don't have permission to view this page.
            This area is restricted to a different role.
          </p>
          <div className="btn-row">
            {user && (
              <button className="btn-primary" onClick={() => navigate(roleHome[user.role] || "/login")}>
                Go to My Dashboard
              </button>
            )}
            <button className="btn-ghost" onClick={() => { logout(); navigate("/login"); }}>
              Sign In with different account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
