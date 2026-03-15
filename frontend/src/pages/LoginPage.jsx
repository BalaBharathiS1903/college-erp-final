import { useState } from "react";
import collegeBg from "../assets/college.png";
import appLogo from "../assets/logo.png";

const roles = [
  { id:"ADMIN",   label:"Admin",   icon:"⚙️",  color:"#e84545", desc:"System Administrator" },
  { id:"STAFF",   label:"Staff",   icon:"👨‍🏫", color:"#f5a623", desc:"Faculty Member"        },
  { id:"STUDENT", label:"Student", icon:"🎓",  color:"#4a90e2", desc:"Enrolled Student"      },
];

export default function LoginPage({ onLogin }) {
  const [sel, setSel]       = useState("STUDENT");
  const [form, setForm]     = useState({ username:"", password:"" });
  const [showPwd, setShow]  = useState(false);
  const [loading, setLoad]  = useState(false);
  const [error, setError]   = useState("");
  const role = roles.find(r => r.id === sel);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!form.username || !form.password) { setError("Please enter both fields."); return; }
    setLoad(true);
    try {
      if (onLogin) await onLogin(form.username, form.password, sel);
      else { await new Promise(r=>setTimeout(r,1200)); alert(`Login as ${role.label}`); }
    } catch(err) { setError(err.message || "Login failed."); }
    finally { setLoad(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .root{min-height:100vh;background:url(${collegeBg}) center/cover no-repeat;font-family:'DM Sans',sans-serif;display:flex;overflow:hidden;position:relative}
        .root::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg, rgba(10,10,15,0.9) 0%, rgba(10,10,15,0.4) 100%);z-index:0}
        .glow{position:fixed;width:600px;height:600px;border-radius:50%;filter:blur(120px);opacity:.15;z-index:0;transition:background 1s;pointer-events:none}
        .g1{top:-100px;left:-100px;background:var(--rc,#4a90e2)}
        .g2{bottom:-100px;right:-100px;background:#e84545;opacity:.1}
        .left{flex:1;display:flex;flex-direction:column;justify-content:center;padding:60px;position:relative;z-index:1}
        .left-content{position:relative;z-index:1;max-width:540px}
        .blogo{width:52px;height:52px;background:#fff;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:18px;transition:background .5s;box-shadow:0 8px 24px rgba(0,0,0,0.4);object-fit:contain;padding:4px}
        .bname{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.5)}
        .btag{font-size:12px;color:rgba(255,255,255,.6);margin-top:4px;letter-spacing:2px;text-transform:uppercase;text-shadow:0 1px 4px rgba(0,0,0,0.5)}
        .hero{font-family:'Syne',sans-serif;font-size:50px;font-weight:800;color:#fff;line-height:1.1;letter-spacing:-2px;margin:56px 0 18px;text-shadow:0 4px 16px rgba(0,0,0,0.6)}
        .hac{background:linear-gradient(135deg,var(--rc,#4a90e2),#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))}
        .hdesc{font-size:15px;color:rgba(255,255,255,.7);max-width:360px;line-height:1.75;text-shadow:0 2px 10px rgba(0,0,0,0.8)}
        .stats{display:flex;gap:40px;margin-top:56px}
        .snum{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,0.6)}
        .slbl{font-size:11px;color:rgba(255,255,255,.6);text-transform:uppercase;letter-spacing:1.5px;margin-top:2px;text-shadow:0 1px 4px rgba(0,0,0,0.6)}
        .right{width:460px;background:rgba(15,15,22,.4);border-left:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;padding:48px 38px;position:relative;z-index:1;backdrop-filter:blur(32px)}
        .card{width:100%}
        .ctitle{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:#fff;margin-bottom:4px}
        .csub{font-size:13px;color:rgba(255,255,255,.38);margin-bottom:28px}
        .rtabs{display:flex;gap:7px;margin-bottom:28px;background:rgba(255,255,255,.04);padding:5px;border-radius:13px;border:1px solid rgba(255,255,255,.06)}
        .rtab{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:11px 7px;border-radius:9px;border:none;background:transparent;cursor:pointer;transition:all .2s}
        .rtab.on{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1)}
        .rico{font-size:19px}
        .rnm{font-size:10px;font-weight:700;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.5px;transition:color .2s}
        .rtab.on .rnm{color:#fff}
        .rbadge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);border-radius:20px;padding:4px 12px;font-size:12px;color:rgba(255,255,255,.45);margin-bottom:22px}
        .rdot{width:6px;height:6px;border-radius:50%;background:var(--rc,#4a90e2)}
        .flbl{display:block;font-size:11px;font-weight:600;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:1px;margin-bottom:7px}
        .fgrp{margin-bottom:18px}
        .iwrap{position:relative}
        .finp{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:13px 15px;color:#fff;font-size:15px;font-family:'DM Sans',sans-serif;outline:none;transition:all .2s}
        .finp::placeholder{color:rgba(255,255,255,.18)}
        .finp:focus{border-color:var(--rc,#4a90e2);background:rgba(255,255,255,.07);box-shadow:0 0 0 3px rgba(74,144,226,.1)}
        .eyebtn{position:absolute;right:13px;top:50%;transform:translateY(-50%);background:none;border:none;color:rgba(255,255,255,.3);cursor:pointer;font-size:16px;transition:color .2s}
        .eyebtn:hover{color:rgba(255,255,255,.65)}
        .forgot{display:block;text-align:right;font-size:12px;color:rgba(255,255,255,.3);text-decoration:none;margin-top:7px;transition:color .2s}
        .forgot:hover{color:var(--rc,#4a90e2)}
        .errbox{background:rgba(232,69,69,.1);border:1px solid rgba(232,69,69,.25);border-radius:10px;padding:10px 14px;color:#f87171;font-size:13px;margin-bottom:16px}
        .sbtn{width:100%;padding:15px;border:none;border-radius:11px;margin-top:6px;color:#fff;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;letter-spacing:.5px;transition:all .3s;display:flex;align-items:center;justify-content:center;gap:8px}
        .sbtn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 28px rgba(74,144,226,.3)}
        .sbtn:disabled{opacity:.7;cursor:not-allowed}
        .spin{width:17px;height:17px;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;border-radius:50%;animation:sp .8s linear infinite}
        @keyframes sp{to{transform:rotate(360deg)}}
        .div{display:flex;align-items:center;gap:12px;margin:22px 0;color:rgba(255,255,255,.13);font-size:11px;text-transform:uppercase;letter-spacing:1px}
        .div::before,.div::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.06)}
        .fnote{text-align:center;font-size:12px;color:rgba(255,255,255,.18);margin-top:24px}
        @media(max-width:768px){.left{display:none}.right{width:100%;border-left:none;padding:36px 22px}}
      `}</style>
      <div className="root" style={{"--rc":role.color}}>
        <div className="glow g1"/><div className="glow g2"/>
        <div className="left">
          <div className="left-content">
            <div><img src={appLogo} alt="Logo" className="blogo"/><div className="bname">BHC ERP</div><div className="btag">College Management System</div></div>
            <div className="hero">Smart Campus.<br/><span className="hac">Unified Control.</span></div>
            <p className="hdesc">One platform to manage admissions, academics, fees, attendance, and results — for administrators, faculty, and students.</p>
            <div className="stats">
              <div><div className="snum">8</div><div className="slbl">Semesters</div></div>
              <div><div className="snum">3</div><div className="slbl">User Roles</div></div>
              <div><div className="snum">360°</div><div className="slbl">Management</div></div>
            </div>
          </div>
        </div>
        <div className="right">
          <div className="card">
            <div className="ctitle">Welcome Back</div>
            <div className="csub">Sign in to your ERP account</div>
            <div className="rtabs">
              {roles.map(r=>(
                <button key={r.id} className={`rtab ${sel===r.id?"on":""}`} onClick={()=>{setSel(r.id);setError("")}}>
                  <span className="rico">{r.icon}</span><span className="rnm">{r.label}</span>
                </button>
              ))}
            </div>
            <div className="rbadge"><span className="rdot"/>{role.desc}</div>
            {error && <div className="errbox">⚠️ {error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="fgrp">
                <label className="flbl">{sel==="STUDENT"?"Register No.":"Username / Email"}</label>
                <div className="iwrap">
                  <input className="finp" type="text" placeholder={sel==="STUDENT"?"e.g. 21CSE001":"Enter your username"} value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/>
                </div>
              </div>
              <div className="fgrp">
                <label className="flbl">Password</label>
                <div className="iwrap">
                  <input className="finp" type={showPwd?"text":"password"} placeholder="Enter your password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{paddingRight:44}}/>
                  <button type="button" className="eyebtn" onClick={()=>setShow(p=>!p)}>{showPwd?"🙈":"👁️"}</button>
                </div>
                <a href="#" className="forgot" onClick={(e) => { e.preventDefault(); alert("Admin: admin@123\nStaff: staff@123\nStudent: student@123"); }}>Forgot password?</a>
              </div>
              <button type="submit" className="sbtn" disabled={loading} style={{background:`linear-gradient(135deg,${role.color},#a855f7)`}}>
                {loading?<><div className="spin"/>Signing in…</>:<>Sign in as {role.label} →</>}
              </button>
            </form>
            <div className="div">Secured Access</div>
            <div className="fnote">🔒 Protected by JWT Authentication · © 2025 BHC ERP</div>
          </div>
        </div>
      </div>
    </>
  );
}
