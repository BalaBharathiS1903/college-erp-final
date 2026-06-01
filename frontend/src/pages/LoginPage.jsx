import { useState } from "react";
import appLogo from "../assets/logo.png";
import { Icon } from "../components/Icons";

const roles = [
  { id: "ADMIN",   label: "Admin",   color: "#e84545", desc: "System Administrator" },
  { id: "STAFF",   label: "Staff",   color: "#f5a623", desc: "Faculty Member"        },
  { id: "STUDENT", label: "Student", color: "#4a90e2", desc: "Enrolled Student"      },
];

const RoleIcon = ({ id, size = 18 }) => {
  if (id === "ADMIN")   return <Icon name="staffAlloc" size={size} />;
  if (id === "STAFF")   return <Icon name="staff"      size={size} />;
  return <Icon name="student" size={size} />;
};

export default function LoginPage({ onLogin }) {
  const [sel, setSel]      = useState("STUDENT");
  const [form, setForm]    = useState({ username: "", password: "" });
  const [showPwd, setShow] = useState(false);
  const [loading, setLoad] = useState(false);
  const [error, setError]  = useState("");
  const role = roles.find(r => r.id === sel);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!form.username || !form.password) { setError("Please enter both fields."); return; }
    setLoad(true);
    try {
      if (onLogin) await onLogin(form.username, form.password, sel);
      else { await new Promise(r => setTimeout(r, 1200)); alert(`Login as ${role.label}`); }
    } catch (err) { setError(err.message || "Login failed."); }
    finally { setLoad(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .lp-root{min-height:100vh;background:#f8fafc;font-family:'DM Sans',sans-serif;display:flex;overflow:hidden;position:relative;color:#111827}
        .lp-left{flex:1;display:flex;flex-direction:column;justify-content:center;padding:60px;position:relative;z-index:1}
        .lp-left-content{max-width:540px;animation:lp-slideIn .6s ease both}
        @keyframes lp-slideIn{from{opacity:0;transform:translateX(-28px)}to{opacity:1;transform:translateX(0)}}
        .lp-logo-wrap{display:flex;align-items:center;gap:12px;margin-bottom:18px}
        .lp-logo{width:52px;height:52px;background:#fff;border-radius:14px;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 35px rgba(15,23,42,0.08);object-fit:contain;padding:4px}
        .lp-bname{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;color:#0f172a}
        .lp-btag{font-size:11px;color:#475569;letter-spacing:2px;text-transform:uppercase}
        .lp-hero{font-family:'Syne',sans-serif;font-size:50px;font-weight:800;color:#0f172a;line-height:1.05;letter-spacing:-2px;margin:56px 0 18px}
        .lp-hac{background:linear-gradient(135deg,var(--rc,#4a90e2),#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .lp-hdesc{font-size:15px;color:#475569;max-width:360px;line-height:1.75}
        .lp-stats{display:flex;gap:32px;margin-top:56px}
        .lp-snum{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;color:#111827}
        .lp-slbl{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:1.5px;margin-top:2px}
        .lp-right{width:460px;background:#fff;border-left:1px solid #e2e8f0;display:flex;align-items:center;justify-content:center;padding:48px 38px;position:relative;z-index:1;box-shadow:0 20px 60px rgba(15,23,42,0.05)}
        .lp-card{width:100%;animation:lp-fadeUp .5s ease .1s both}
        @keyframes lp-fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        .lp-ctitle{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:#0f172a;margin-bottom:4px}
        .lp-csub{font-size:13px;color:#475569;margin-bottom:28px}
        .lp-rtabs{display:flex;gap:7px;margin-bottom:28px;background:#f8fafc;padding:5px;border-radius:13px;border:1px solid #e2e8f0}
        .lp-rtab{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:11px 7px;border-radius:9px;border:none;background:transparent;cursor:pointer;transition:all .2s;color:#475569}
        .lp-rtab.on{background:#fff;border:1px solid #cbd5e1;box-shadow:0 10px 24px rgba(15,23,42,0.05)}
        .lp-rico{width:32px;height:32px;border-radius:10px;background:rgba(241,245,249,0.9);display:flex;align-items:center;justify-content:center;color:#1e293b;transition:background .2s}
        .lp-rtab.on .lp-rico{background:var(--rc,#4a90e2);color:#fff}
        .lp-rnm{font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;transition:color .2s}
        .lp-rtab.on .lp-rnm{color:#0f172a}
        .lp-rbadge{display:inline-flex;align-items:center;gap:6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:8px 12px;font-size:12px;color:#64748b;margin-bottom:22px}
        .lp-rdot{width:6px;height:6px;border-radius:50%;background:var(--rc,#4a90e2)}
        .lp-flbl{display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:7px}
        .lp-fgrp{margin-bottom:18px}
        .lp-iwrap{position:relative}
        .lp-finp{width:100%;background:#f8fafc;border:1px solid #d1d5db;border-radius:11px;padding:13px 15px;color:#111827;font-size:15px;font-family:'DM Sans',sans-serif;outline:none;transition:all .2s}
        .lp-finp::placeholder{color:#94a3b8}
        .lp-finp:focus{border-color:var(--rc,#4a90e2);background:#fff;box-shadow:0 0 0 3px rgba(59,130,246,.12)}
        .lp-eyebtn{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;color:#64748b;cursor:pointer;font-size:12px;font-weight:600;transition:color .2s;font-family:'DM Sans',sans-serif}
        .lp-eyebtn:hover{color:#0f172a}
        .lp-forgot{display:block;text-align:right;font-size:12px;color:#64748b;text-decoration:none;margin-top:7px;transition:all .2s}
        .lp-forgot:hover{color:var(--rc,#4a90e2)}
        .lp-errbox{background:#fee2e2;border:1px solid #fecaca;border-radius:10px;padding:10px 14px;color:#991b1b;font-size:13px;margin-bottom:16px;display:flex;align-items:center;gap:8px;animation:lp-shake .3s ease}
        @keyframes lp-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
        .lp-sbtn{width:100%;padding:15px;border:none;border-radius:11px;margin-top:6px;color:#fff;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:.5px;transition:all .3s;display:flex;align-items:center;justify-content:center;gap:8px}
        .lp-sbtn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 32px rgba(59,130,246,.25)}
        .lp-sbtn:disabled{opacity:.7;cursor:not-allowed}
        .lp-spin{width:17px;height:17px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:lp-sp .8s linear infinite}
        @keyframes lp-sp{to{transform:rotate(360deg)}}
        .lp-div{display:flex;align-items:center;gap:12px;margin:22px 0;color:#94a3b8;font-size:11px;text-transform:uppercase;letter-spacing:1px}
        .lp-div::before,.lp-div::after{content:'';flex:1;height:1px;background:#e2e8f0}
        .lp-fnote{text-align:center;font-size:12px;color:#94a3b8;margin-top:24px}
        @media(max-width:768px){.lp-left{display:none}.lp-right{width:100%;border-left:none;padding:36px 22px}}
      `}</style>
      <div className="lp-root" style={{ "--rc": role.color }}>
        <div className="lp-left">
          <div className="lp-left-content">
            <div className="lp-logo-wrap">
              <img src={appLogo} alt="Logo" className="lp-logo" />
              <div><div className="lp-bname">BHC ERP</div><div className="lp-btag">College Management System</div></div>
            </div>
            <div className="lp-hero">Smart Campus.<br /><span className="lp-hac">Unified Control.</span></div>
            <p className="lp-hdesc">One platform to manage admissions, academics, fees, attendance, and results — for administrators, faculty, and students.</p>
            <div className="lp-stats">
              <div><div className="lp-snum">8</div><div className="lp-slbl">Semesters</div></div>
              <div><div className="lp-snum">3</div><div className="lp-slbl">User Roles</div></div>
              <div><div className="lp-snum">360°</div><div className="lp-slbl">Management</div></div>
            </div>
          </div>
        </div>
        <div className="lp-right">
          <div className="lp-card">
            <div className="lp-ctitle">Welcome Back</div>
            <div className="lp-csub">Sign in to your ERP account</div>
            <div className="lp-rtabs">
              {roles.map(r => (
                <button key={r.id} className={`lp-rtab ${sel === r.id ? "on" : ""}`} onClick={() => { setSel(r.id); setError(""); }}>
                  <span className="lp-rico"><RoleIcon id={r.id} size={16} /></span>
                  <span className="lp-rnm">{r.label}</span>
                </button>
              ))}
            </div>
            <div className="lp-rbadge"><span className="lp-rdot" />{role.desc}</div>
            {error && (
              <div className="lp-errbox">
                <Icon name="warning" size={14} style={{ color: "#991b1b", flexShrink: 0 }} />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="lp-fgrp">
                <label className="lp-flbl">{sel === "STUDENT" ? "Register No." : "Username / Email"}</label>
                <div className="lp-iwrap">
                  <input className="lp-finp" type="text" placeholder={sel === "STUDENT" ? "e.g. 21CSE001" : "Enter your username"} value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                </div>
              </div>
              <div className="lp-fgrp">
                <label className="lp-flbl" htmlFor="lp-password">Password</label>
                <div className="lp-iwrap">
                  <input id="lp-password" className="lp-finp" type={showPwd ? "text" : "password"} placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={{ paddingRight: 52 }} />
                  <button type="button" className="lp-eyebtn" onClick={() => setShow(p => !p)}>{showPwd ? "Hide" : "Show"}</button>
                </div>
                <a href="#" className="lp-forgot" onClick={e => { e.preventDefault(); alert("Please contact your system administrator to reset your password."); }}>Forgot password?</a>
              </div>
              <button type="submit" className="lp-sbtn" disabled={loading} style={{ background: `linear-gradient(135deg,${role.color},#a855f7)` }}>
                {loading
                  ? <><div className="lp-spin" />Signing in...</>
                  : <><Icon name="arrow" size={16} />Sign in as {role.label}</>}
              </button>
            </form>
            <div className="lp-div">Secured Access</div>
            <div className="lp-fnote">Protected by JWT Authentication · © 2025 BHC ERP</div>
          </div>
        </div>
      </div>
    </>
  );
}
