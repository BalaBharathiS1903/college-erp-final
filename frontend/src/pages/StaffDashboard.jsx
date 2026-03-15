import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ─── Mock Data ───────────────────────────────────────────────
const SUBJECTS = [
  { id: 1, code: "CS601", name: "Data Structures",  credits: 3, sem: 6 },
  { id: 2, code: "CS602", name: "DBMS",             credits: 4, sem: 6 },
  { id: 3, code: "CS603", name: "Operating Systems",credits: 3, sem: 6 },
  { id: 4, code: "CS604", name: "Computer Networks",credits: 3, sem: 6 },
];

const STUDENTS = [
  { id: 1, regNo: "21CSE001", name: "Arjun Selvan",    dept: "CSE", sem: 6 },
  { id: 2, regNo: "21CSE002", name: "Priya Lakshmi",   dept: "CSE", sem: 6 },
  { id: 3, regNo: "21CSE003", name: "Karthik Raja",    dept: "CSE", sem: 6 },
  { id: 4, regNo: "21CSE004", name: "Deepa Suresh",    dept: "CSE", sem: 6 },
  { id: 5, regNo: "21CSE005", name: "Vignesh Kumar",   dept: "CSE", sem: 6 },
  { id: 6, regNo: "21CSE006", name: "Meena Priya",     dept: "CSE", sem: 6 },
  { id: 7, regNo: "21CSE007", name: "Rahul Natarajan", dept: "CSE", sem: 6 },
  { id: 8, regNo: "21CSE008", name: "Sowmiya Raj",     dept: "CSE", sem: 6 },
];

const PERIODS = [
  { id: 1, label: "P1", time: "9:00–10:00"  },
  { id: 2, label: "P2", time: "10:00–11:00" },
  { id: 3, label: "P3", time: "11:00–12:00" },
  { id: 4, label: "P4", time: "2:00–3:00"   },
  { id: 5, label: "P5", time: "3:00–4:00"   },
  { id: 6, label: "P6", time: "4:00–5:00"   },
];

const STATUS_META = {
  P:  { label: "Present", color: "#4ade80", bg: "rgba(74,222,128,0.12)"  },
  A:  { label: "Absent",  color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  OD: { label: "OD",      color: "#fbbf24", bg: "rgba(251,191,36,0.12)"  },
  L:  { label: "Late",    color: "#c084fc", bg: "rgba(192,132,252,0.12)" },
};

const TODAY = new Date().toISOString().split("T")[0];

const initAttendance = () => {
  const a = {};
  STUDENTS.forEach(s => {
    a[s.id] = {};
    PERIODS.forEach(p => { a[s.id][p.id] = "A"; });
  });
  return a;
};

const initCIA = () => {
  const m = {};
  STUDENTS.forEach(s => {
    m[s.id] = {};
    SUBJECTS.forEach(sub => { m[s.id][sub.id] = { cia1: "", cia2: "", cia3: "" }; });
  });
  return m;
};

const initSem = () => {
  const m = {};
  STUDENTS.forEach(s => {
    m[s.id] = {};
    SUBJECTS.forEach(sub => { m[s.id][sub.id] = ""; });
  });
  return m;
};

const NAV = [
  { id: "dashboard",  icon: "⬡", label: "Dashboard"       },
  { id: "attendance", icon: "✓", label: "Attendance"       },
  { id: "cia",        icon: "✎", label: "CIA Marks"        },
  { id: "semester",   icon: "⊞", label: "Semester Marks"   },
  { id: "students",   icon: "◎", label: "My Students"      },
];

const SUBJ_COLORS = ["#f59e0b","#10b981","#4a90e2","#c084fc"];

export default function StaffDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };
  const [tab, setTab]               = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selSubject, setSelSubject]   = useState(SUBJECTS[0].id);
  const [selDate, setSelDate]         = useState(TODAY);
  const [attendance, setAttendance]   = useState(initAttendance);
  const [savedSessions, setSavedSessions] = useState([]);
  const [ciaMarks, setCiaMarks]       = useState(initCIA);
  const [ciaSubject, setCiaSubject]   = useState(SUBJECTS[0].id);
  const [semMarks, setSemMarks]       = useState(initSem);
  const [semSubject, setSemSubject]   = useState(SUBJECTS[0].id);
  const [studentSearch, setStudentSearch] = useState("");
  const [toast, setToast]             = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  // ── Attendance helpers ─────────────────────────────────────
  const cycleStatus = (sid, pid) => {
    const cycle = ["A","P","OD","L"];
    setAttendance(prev => {
      const cur = prev[sid][pid];
      const nxt = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
      return { ...prev, [sid]: { ...prev[sid], [pid]: nxt } };
    });
  };

  const markAll = (status) => {
    setAttendance(prev => {
      const u = { ...prev };
      STUDENTS.forEach(s => {
        u[s.id] = {};
        PERIODS.forEach(p => { u[s.id][p.id] = status; });
      });
      return u;
    });
  };

  const saveAttendance = () => {
    const subjName = SUBJECTS.find(s => s.id === selSubject)?.name || "";
    const present  = STUDENTS.filter(s =>
      Object.values(attendance[s.id]).some(v => v === "P" || v === "OD")
    ).length;
    setSavedSessions(prev => [{
      id: Date.now(), date: selDate, subject: subjName,
      total: STUDENTS.length, present,
    }, ...prev.slice(0, 4)]);
    showToast("✅ Attendance saved for " + subjName);
  };

  // ── CIA helpers ────────────────────────────────────────────
  const setCIA = (sid, subId, key, val) => {
    const v = val === "" ? "" : Math.min(50, Math.max(0, Number(val)));
    setCiaMarks(prev => ({
      ...prev,
      [sid]: { ...prev[sid], [subId]: { ...prev[sid][subId], [key]: v } },
    }));
  };

  // ── Computed stats ─────────────────────────────────────────
  const attStats = STUDENTS.map(s => {
    const vals = Object.values(attendance[s.id] || {});
    const present = vals.filter(v => v === "P" || v === "OD").length;
    const pct = vals.length ? Math.round((present / vals.length) * 100) : 0;
    return { ...s, present, total: vals.length, pct };
  });

  const ciaSubjName = SUBJECTS.find(s => s.id === ciaSubject)?.name || "";
  const semSubjName = SUBJECTS.find(s => s.id === semSubject)?.name || "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(245,158,11,.2);border-radius:4px}

        .sr{display:flex;min-height:100vh;background:#0d1117;font-family:'Outfit',sans-serif;color:#e6edf3}

        /* ── Sidebar ── */
        .sb{width:220px;min-height:100vh;flex-shrink:0;background:#010409;
          border-right:1px solid rgba(245,158,11,.07);
          display:flex;flex-direction:column;padding:20px 0;transition:width .3s}
        .sb.cl{width:58px}
        .sb-brand{display:flex;align-items:center;gap:10px;padding:0 16px 22px;
          border-bottom:1px solid rgba(255,255,255,.04);overflow:hidden}
        .sb-logo{width:34px;height:34px;flex-shrink:0;
          background:linear-gradient(135deg,#f59e0b,#10b981);
          border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:17px}
        .sb-title{font-size:14px;font-weight:700;color:#f59e0b;white-space:nowrap}
        .sb-sub{font-size:10px;color:rgba(255,255,255,.3)}
        .sb-sec{font-size:9px;font-weight:600;color:rgba(255,255,255,.2);text-transform:uppercase;
          letter-spacing:1.5px;padding:14px 18px 6px;overflow:hidden;white-space:nowrap}
        .sb-item{display:flex;align-items:center;gap:11px;padding:9px 16px;margin:1px 8px;
          border-radius:8px;cursor:pointer;overflow:hidden;white-space:nowrap;
          border:none;background:none;color:rgba(255,255,255,.38);
          font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;
          width:calc(100% - 16px);text-align:left;transition:all .2s}
        .sb-item:hover{background:rgba(255,255,255,.04);color:#e6edf3}
        .sb-item.on{background:rgba(245,158,11,.1);color:#f59e0b;border:1px solid rgba(245,158,11,.2)}
        .sb-icon{font-size:15px;flex-shrink:0}
        .sb-foot{margin-top:auto;padding:14px 16px;border-top:1px solid rgba(255,255,255,.04)}
        .av{width:30px;height:30px;border-radius:8px;flex-shrink:0;
          background:linear-gradient(135deg,#f59e0b,#10b981);
          display:flex;align-items:center;justify-content:center;font-size:14px}
        .av-name{font-size:12px;font-weight:600;white-space:nowrap}
        .av-role{font-size:10px;color:rgba(255,255,255,.3)}

        /* ── Main ── */
        .main{flex:1;display:flex;flex-direction:column;overflow:hidden}
        .topbar{height:54px;border-bottom:1px solid rgba(255,255,255,.05);
          display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;
          background:rgba(1,4,9,.7);backdrop-filter:blur(10px)}
        .menu-btn{width:30px;height:30px;border-radius:7px;background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.06);color:#888;cursor:pointer;font-size:13px}
        .pg-title{font-size:16px;font-weight:700}
        .staff-chip{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.25);
          color:#f59e0b;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px}

        .content{flex:1;overflow-y:auto;padding:24px}

        /* ── Stat cards ── */
        .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
        .mc{background:#010409;border:1px solid rgba(255,255,255,.06);border-radius:14px;
          padding:18px;transition:border-color .2s}
        .mc:hover{border-color:rgba(245,158,11,.3)}
        .mc-top{display:flex;justify-content:space-between;align-items:flex-start}
        .mc-lbl{font-size:11px;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
        .mc-val{font-size:26px;font-weight:800;font-family:'Fira Code',monospace}
        .mc-sub{font-size:11px;color:rgba(255,255,255,.25);margin-top:4px}

        /* ── Section ── */
        .sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
        .sec-title{font-size:16px;font-weight:700}
        .sec-sub{font-size:11px;color:rgba(255,255,255,.3);margin-top:2px}

        /* ── Buttons ── */
        .btn-amber{background:linear-gradient(135deg,#f59e0b,#f97316);border:none;color:#000;
          padding:9px 18px;border-radius:9px;font-family:'Outfit',sans-serif;font-size:13px;
          font-weight:700;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .2s}
        .btn-amber:hover{transform:translateY(-1px);box-shadow:0 5px 18px rgba(245,158,11,.35)}
        .btn-green{background:linear-gradient(135deg,#10b981,#059669);border:none;color:#fff;
          padding:9px 18px;border-radius:9px;font-weight:700;font-size:13px;
          cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px}
        .btn-green:hover{transform:translateY(-1px);box-shadow:0 5px 18px rgba(16,185,129,.3)}
        .btn-ghost{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
          color:rgba(255,255,255,.5);padding:7px 14px;border-radius:8px;
          font-size:12px;cursor:pointer;transition:all .2s}
        .btn-ghost:hover{background:rgba(255,255,255,.07);color:#fff}

        /* ── Controls ── */
        .ctrl-row{display:flex;gap:10px;margin-bottom:18px;flex-wrap:wrap;align-items:center}
        .sel,date-in{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
          border-radius:9px;padding:8px 14px;color:#e6edf3;font-size:13px;outline:none;
          font-family:'Outfit',sans-serif;cursor:pointer}
        .sel option{background:#010409}
        .date-in{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
          border-radius:9px;padding:8px 14px;color:#e6edf3;font-size:13px;outline:none}
        .date-in::-webkit-calendar-picker-indicator{filter:invert(.6)}

        /* ── Table base ── */
        .tbl-wrap{background:#010409;border:1px solid rgba(255,255,255,.06);border-radius:14px;overflow:hidden}
        .tbl{width:100%;border-collapse:collapse}
        .tbl th{padding:10px 14px;text-align:center;font-size:10px;font-weight:700;
          color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:1px;
          background:rgba(255,255,255,.02);border-bottom:1px solid rgba(255,255,255,.04)}
        .tbl th.lft{text-align:left}
        .tbl td{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.03);text-align:center;font-size:13px}
        .tbl td.lft{text-align:left}
        .tbl tr:last-child td{border-bottom:none}
        .tbl tr:hover td{background:rgba(255,255,255,.013)}
        .s-name{font-size:13px;font-weight:600}
        .s-reg{font-size:11px;color:rgba(255,255,255,.3);font-family:'Fira Code',monospace;margin-top:1px}

        /* ── Status toggle ── */
        .sts-btn{width:38px;height:26px;border-radius:6px;border:none;cursor:pointer;
          font-size:10px;font-weight:700;transition:all .15s;font-family:'Outfit',sans-serif}

        /* ── Pct bar ── */
        .pbar-bg{width:52px;height:4px;background:rgba(255,255,255,.06);border-radius:3px;margin-top:3px}
        .pbar-fill{height:100%;border-radius:3px}

        /* ── Mark input ── */
        .mk-in{width:58px;height:32px;text-align:center;
          background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);
          border-radius:7px;color:#e6edf3;font-size:13px;font-family:'Fira Code',monospace;
          outline:none;transition:border-color .2s}
        .mk-in:focus{border-color:#f59e0b;box-shadow:0 0 0 2px rgba(245,158,11,.12)}
        .mk-in::placeholder{color:rgba(255,255,255,.15)}

        /* ── Chip ── */
        .chip{display:inline-block;font-family:'Fira Code',monospace;
          font-size:12px;font-weight:600;padding:3px 10px;border-radius:6px}

        /* ── Subject sub-tabs ── */
        .sub-tabs{display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap}
        .sub-tab{padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;
          border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);
          color:rgba(255,255,255,.4);transition:all .2s}
        .sub-tab.on{background:rgba(245,158,11,.12);border-color:rgba(245,158,11,.3);color:#f59e0b}

        /* ── Search ── */
        .search-in{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);
          border-radius:9px;padding:8px 14px;color:#e6edf3;font-size:13px;outline:none;
          width:260px;font-family:'Outfit',sans-serif}
        .search-in::placeholder{color:rgba(255,255,255,.2)}

        /* ── Toast ── */
        .toast{position:fixed;bottom:28px;right:28px;background:#10b981;color:#fff;
          padding:12px 22px;border-radius:10px;font-weight:600;font-size:14px;
          box-shadow:0 8px 24px rgba(16,185,129,.3);z-index:999;
          animation:fu .3s ease}
        @keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

        /* ── Session row ── */
        .sess-row{display:flex;align-items:center;justify-content:space-between;
          background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);
          border-radius:10px;padding:12px 16px;margin-bottom:8px}

        /* ── CIA exam header ── */
        .cia-hd{display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:10px 16px;
          background:rgba(245,158,11,.06);border:1px solid rgba(245,158,11,.15);border-radius:10px}

        /* ── Info box ── */
        .info-box{background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.2);
          border-radius:10px;padding:12px 16px;font-size:13px;color:rgba(245,158,11,.85);
          margin-bottom:16px;display:flex;align-items:center;gap:8px}

        /* ── Subject mini cards ── */
        .subj-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:24px}
        .subj-card{background:#010409;border:1px solid rgba(255,255,255,.06);
          border-radius:13px;padding:16px;transition:border-color .2s}
        .subj-card:hover{border-color:rgba(255,255,255,.12)}

        @media(max-width:900px){.g4{grid-template-columns:repeat(2,1fr)}.subj-grid{grid-template-columns:1fr}.sb{display:none}}
      `}</style>

      <div className="sr">
        {/* ══ SIDEBAR ══════════════════════════════════════════ */}
        <aside className={`sb ${sidebarOpen ? "" : "cl"}`}>
          <div className="sb-brand">
            <div className="sb-logo">🧑‍🏫</div>
            {sidebarOpen && <div><div className="sb-title">BHC ERP</div><div className="sb-sub">Staff Portal</div></div>}
          </div>
          {sidebarOpen && <div className="sb-sec">Navigation</div>}
          {NAV.map(n => (
            <button key={n.id} className={`sb-item ${tab === n.id ? "on" : ""}`} onClick={() => setTab(n.id)}>
              <span className="sb-icon">{n.icon}</span>
              {sidebarOpen && <span>{n.label}</span>}
            </button>
          ))}
          <div className="sb-foot">
            <div style={{ display:"flex", alignItems:"center", gap:10, overflow:"hidden" }}>
              <div className="av">👤</div>
              {sidebarOpen && <div><div className="av-name">{user?.name || "Staff"}</div><div className="av-role">{user?.username}</div></div>}
            </div>
            {sidebarOpen && (
              <button onClick={handleLogout} style={{
                marginTop:12, width:"100%", background:"rgba(248,113,113,0.1)",
                border:"1px solid rgba(248,113,113,0.2)", color:"#f87171",
                padding:"8px 0", borderRadius:8, cursor:"pointer",
                fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:600,
                transition:"all 0.2s",
              }}>🚪 Logout</button>
            )}
          </div>
        </aside>

        {/* ══ MAIN ══════════════════════════════════════════════ */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>☰</button>
              <span className="pg-title">{NAV.find(n => n.id === tab)?.label}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span className="staff-chip">Staff Access</span>
              <span style={{ fontSize:12, color:"rgba(255,255,255,.3)" }}>
                {new Date().toLocaleDateString("en-IN", { weekday:"short", day:"numeric", month:"short" })}
              </span>
            </div>
          </div>

          <div className="content">

            {/* ══ DASHBOARD ════════════════════════════════════ */}
            {tab === "dashboard" && (<>
              <div className="g4">
                {[
                  { lbl:"My Subjects",   val:SUBJECTS.length,  icon:"📘", clr:"#f59e0b", sub:"Semester 6" },
                  { lbl:"My Students",   val:STUDENTS.length,  icon:"🎓", clr:"#10b981", sub:"CSE Batch"  },
                  { lbl:"Today's Slots", val:PERIODS.length,   icon:"🕐", clr:"#c084fc", sub:"Periods"    },
                  { lbl:"Avg Attendance",val:`${Math.round(attStats.reduce((s,a)=>s+a.pct,0)/attStats.length)}%`,
                    icon:"📊", clr:"#4ade80", sub:"Overall" },
                ].map(c => (
                  <div className="mc" key={c.lbl}>
                    <div className="mc-top">
                      <div><div className="mc-lbl">{c.lbl}</div><div className="mc-val" style={{ color:c.clr }}>{c.val}</div></div>
                      <div style={{ fontSize:22 }}>{c.icon}</div>
                    </div>
                    <div className="mc-sub">{c.sub}</div>
                  </div>
                ))}
              </div>

              {/* Subject cards */}
              <div className="sec-hd"><div><div className="sec-title">My Subjects</div><div className="sec-sub">Semester 6 · CSE</div></div></div>
              <div className="subj-grid">
                {SUBJECTS.map((s, i) => (
                  <div className="subj-card" key={s.id} style={{ borderLeft:`3px solid ${SUBJ_COLORS[i]}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:15, fontWeight:700, color:SUBJ_COLORS[i], marginBottom:3 }}>{s.name}</div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,.3)" }}>{s.code} · {s.credits} Credits</div>
                      </div>
                      <span style={{ fontSize:20 }}>📖</span>
                    </div>
                    <div style={{ display:"flex", gap:8, marginTop:12 }}>
                      <button className="btn-ghost" style={{ fontSize:11 }} onClick={() => { setSelSubject(s.id); setTab("attendance"); }}>Mark Attendance</button>
                      <button className="btn-ghost" style={{ fontSize:11 }} onClick={() => { setCiaSubject(s.id); setTab("cia"); }}>Enter CIA</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent sessions */}
              {savedSessions.length > 0 && (<>
                <div className="sec-hd" style={{ marginBottom:12 }}><div className="sec-title">Recent Sessions</div></div>
                {savedSessions.map(s => (
                  <div className="sess-row" key={s.id}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14 }}>{s.subject}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,.35)", marginTop:2 }}>{s.date}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"'Fira Code',monospace", fontSize:14, color:"#10b981" }}>{s.present}/{s.total}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,.3)" }}>present</div>
                    </div>
                  </div>
                ))}
              </>)}
            </>)}

            {/* ══ ATTENDANCE ═══════════════════════════════════ */}
            {tab === "attendance" && (<>
              <div className="sec-hd">
                <div><div className="sec-title">Hour-Based Attendance</div><div className="sec-sub">Click a cell to cycle: A → P → OD → L</div></div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn-ghost" onClick={() => markAll("P")}>All Present</button>
                  <button className="btn-ghost" onClick={() => markAll("A")}>All Absent</button>
                  <button className="btn-green" onClick={saveAttendance}>💾 Save</button>
                </div>
              </div>

              <div className="ctrl-row">
                <select className="sel" value={selSubject} onChange={e => setSelSubject(Number(e.target.value))}>
                  {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.code} – {s.name}</option>)}
                </select>
                <input type="date" className="date-in" value={selDate} onChange={e => setSelDate(e.target.value)} />
                {/* Legend */}
                {Object.entries(STATUS_META).map(([k, v]) => (
                  <span key={k} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:v.color }}>
                    <span style={{ width:22, height:16, background:v.bg, border:`1px solid ${v.color}44`, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", fontSize:9, fontWeight:700 }}>{k}</span>
                    {v.label}
                  </span>
                ))}
              </div>

              <div className="tbl-wrap" style={{ overflowX:"auto" }}>
                <table className="tbl" style={{ minWidth:700 }}>
                  <thead>
                    <tr>
                      <th className="lft" style={{ minWidth:170 }}>Student</th>
                      {PERIODS.map(p => (
                        <th key={p.id} style={{ minWidth:72 }}>
                          <div>{p.label}</div>
                          <div style={{ fontSize:9, opacity:.5, fontWeight:400, marginTop:1 }}>{p.time}</div>
                        </th>
                      ))}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STUDENTS.map(s => {
                      const periods = attendance[s.id] || {};
                      const present = Object.values(periods).filter(v => v === "P" || v === "OD").length;
                      const pct = Math.round((present / PERIODS.length) * 100);
                      const pc = pct >= 75 ? "#4ade80" : pct >= 50 ? "#fbbf24" : "#f87171";
                      return (
                        <tr key={s.id}>
                          <td className="lft">
                            <div className="s-name">{s.name}</div>
                            <div className="s-reg">{s.regNo}</div>
                          </td>
                          {PERIODS.map(p => {
                            const st = periods[p.id] || "A";
                            const m  = STATUS_META[st];
                            return (
                              <td key={p.id}>
                                <button className="sts-btn" style={{ background:m.bg, color:m.color, border:`1px solid ${m.color}44` }} onClick={() => cycleStatus(s.id, p.id)}>
                                  {st}
                                </button>
                              </td>
                            );
                          })}
                          <td>
                            <div style={{ fontWeight:700, color:pc, fontFamily:"'Fira Code',monospace", fontSize:13 }}>{pct}%</div>
                            <div className="pbar-bg"><div className="pbar-fill" style={{ width:`${pct}%`, background:pc }} /></div>
                            <div style={{ fontSize:10, color:"rgba(255,255,255,.25)", marginTop:2 }}>{present}/{PERIODS.length}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>)}

            {/* ══ CIA MARKS ════════════════════════════════════ */}
            {tab === "cia" && (<>
              <div className="sec-hd">
                <div><div className="sec-title">CIA Marks Entry</div><div className="sec-sub">Max 50 per CIA · 3 exams per subject · Best 2 of 3 counted</div></div>
                <button className="btn-green" onClick={() => showToast("✅ CIA Marks Saved!")}>💾 Save Marks</button>
              </div>

              {/* Subject Tabs */}
              <div style={{ marginBottom:6, fontSize:11, color:"rgba(255,255,255,.3)", textTransform:"uppercase", letterSpacing:1 }}>Select Subject</div>
              <div className="sub-tabs">
                {SUBJECTS.map(s => (
                  <button key={s.id} className={`sub-tab ${ciaSubject === s.id ? "on" : ""}`} onClick={() => setCiaSubject(s.id)}>
                    {s.code} · {s.name}
                  </button>
                ))}
              </div>

              {/* CIA 1, 2, 3 entry */}
              {[1, 2, 3].map(n => (
                <div key={n} style={{ marginBottom:22 }}>
                  <div className="cia-hd">
                    <span style={{ fontSize:14, fontWeight:700, color:"#f59e0b" }}>CIA – {n}</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,.35)" }}>Max: 50 marks</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,.35)", marginLeft:"auto" }}>{ciaSubjName}</span>
                  </div>
                  <div className="tbl-wrap">
                    <table className="tbl">
                      <thead>
                        <tr>
                          <th className="lft" style={{ minWidth:180 }}>Student</th>
                          <th>CIA {n} Marks <span style={{ opacity:.45, fontWeight:400 }}>(/ 50)</span></th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {STUDENTS.map(s => {
                          const val    = ciaMarks[s.id]?.[ciaSubject]?.[`cia${n}`] ?? "";
                          const passed = val !== "" && Number(val) >= 25;
                          return (
                            <tr key={s.id}>
                              <td className="lft">
                                <div className="s-name">{s.name}</div>
                                <div className="s-reg">{s.regNo}</div>
                              </td>
                              <td>
                                <input type="number" min="0" max="50" className="mk-in" value={val} placeholder="—"
                                  onChange={e => setCIA(s.id, ciaSubject, `cia${n}`, e.target.value)} />
                              </td>
                              <td>
                                {val !== "" ? (
                                  <span className="chip" style={{ background: passed?"rgba(74,222,128,.1)":"rgba(248,113,113,.1)", color:passed?"#4ade80":"#f87171", border:`1px solid ${passed?"rgba(74,222,128,.3)":"rgba(248,113,113,.3)"}` }}>
                                    {passed ? "PASS" : "FAIL"}
                                  </span>
                                ) : <span style={{ fontSize:12, color:"rgba(255,255,255,.2)" }}>—</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* CIA Summary */}
              <div style={{ marginTop:8, marginBottom:12 }}>
                <div className="sec-title" style={{ fontSize:15, marginBottom:14 }}>CIA Summary — {ciaSubjName}</div>
              </div>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th className="lft">Student</th>
                      <th>CIA 1 <span style={{ opacity:.45, fontWeight:400 }}>/50</span></th>
                      <th>CIA 2 <span style={{ opacity:.45, fontWeight:400 }}>/50</span></th>
                      <th>CIA 3 <span style={{ opacity:.45, fontWeight:400 }}>/50</span></th>
                      <th>Best 2 Sum</th>
                      <th>Scaled <span style={{ opacity:.45, fontWeight:400 }}>/25</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {STUDENTS.map(s => {
                      const m    = ciaMarks[s.id]?.[ciaSubject] || {};
                      const vals = [m.cia1, m.cia2, m.cia3].map(v => (v===""||v===undefined) ? null : Number(v));
                      const filled = vals.filter(v => v !== null);
                      const top2  = [...filled].sort((a,b)=>b-a).slice(0,2);
                      const best2 = top2.length === 2 ? top2[0]+top2[1] : null;
                      const scaled= best2 !== null ? Math.round((best2/100)*25) : null;
                      return (
                        <tr key={s.id}>
                          <td className="lft"><div className="s-name">{s.name}</div><div className="s-reg">{s.regNo}</div></td>
                          {[m.cia1, m.cia2, m.cia3].map((v,i) => (
                            <td key={i}>
                              <span style={{ fontFamily:"'Fira Code',monospace", fontSize:13, color:v!==""&&v!==undefined?(Number(v)>=25?"#4ade80":"#f87171"):"rgba(255,255,255,.2)" }}>
                                {v!==""&&v!==undefined ? v : "—"}
                              </span>
                            </td>
                          ))}
                          <td><span style={{ fontFamily:"'Fira Code',monospace", fontSize:13, color:"#f59e0b" }}>{best2!==null?best2:"—"}</span></td>
                          <td>
                            <span className="chip" style={{ background:scaled!==null?"rgba(245,158,11,.1)":"transparent", color:scaled!==null?"#f59e0b":"rgba(255,255,255,.2)", border:scaled!==null?"1px solid rgba(245,158,11,.25)":"none" }}>
                              {scaled!==null ? scaled : "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>)}

            {/* ══ SEMESTER MARKS ═══════════════════════════════ */}
            {tab === "semester" && (<>
              <div className="sec-hd">
                <div><div className="sec-title">Semester Exam Marks</div><div className="sec-sub">Max 100 · Pass ≥ 50 · Grade: O/A+/A/B+/B/F</div></div>
                <button className="btn-green" onClick={() => showToast("✅ Semester marks saved!")}>💾 Save Marks</button>
              </div>
              <div className="info-box">⚠️ Semester marks entry is enabled by Admin. Contact admin for corrections after saving.</div>
              <div className="sub-tabs">
                {SUBJECTS.map(s => (
                  <button key={s.id} className={`sub-tab ${semSubject === s.id ? "on" : ""}`} onClick={() => setSemSubject(s.id)}>
                    {s.code} · {s.name}
                  </button>
                ))}
              </div>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th className="lft" style={{ minWidth:180 }}>Student</th>
                      <th>Marks <span style={{ opacity:.45, fontWeight:400 }}>(/ 100)</span></th>
                      <th>Grade</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STUDENTS.map(s => {
                      const val  = semMarks[s.id]?.[semSubject] ?? "";
                      const num  = Number(val);
                      const g    = val===""?"—":num>=90?"O":num>=80?"A+":num>=70?"A":num>=60?"B+":num>=50?"B":"F";
                      const pass = val!==""&&num>=50;
                      return (
                        <tr key={s.id}>
                          <td className="lft"><div className="s-name">{s.name}</div><div className="s-reg">{s.regNo}</div></td>
                          <td>
                            <input type="number" min="0" max="100" className="mk-in" style={{ width:70 }} value={val} placeholder="—"
                              onChange={e => { const v=e.target.value===""?"":Math.min(100,Math.max(0,Number(e.target.value))); setSemMarks(prev=>({...prev,[s.id]:{...prev[s.id],[semSubject]:v}})); }} />
                          </td>
                          <td>
                            <span className="chip" style={{ background:"rgba(245,158,11,.08)", color:val!==""?"#f59e0b":"rgba(255,255,255,.2)", border:val!==""?"1px solid rgba(245,158,11,.2)":"none", fontFamily:"'Fira Code',monospace" }}>
                              {g}
                            </span>
                          </td>
                          <td>
                            {val!=="" ? (
                              <span className="chip" style={{ background:pass?"rgba(74,222,128,.1)":"rgba(248,113,113,.1)", color:pass?"#4ade80":"#f87171", border:`1px solid ${pass?"rgba(74,222,128,.3)":"rgba(248,113,113,.3)"}` }}>
                                {pass?"PASS":"FAIL"}
                              </span>
                            ) : <span style={{ fontSize:12, color:"rgba(255,255,255,.2)" }}>Pending</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>)}

            {/* ══ MY STUDENTS ══════════════════════════════════ */}
            {tab === "students" && (<>
              <div className="sec-hd">
                <div><div className="sec-title">My Students</div><div className="sec-sub">CSE · Semester 6 · {STUDENTS.length} enrolled</div></div>
                <input className="search-in" placeholder="🔍  Search student..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
              </div>
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th className="lft">Student</th>
                      <th className="lft">Reg. No.</th>
                      <th>Attendance %</th>
                      <th>CIA Avg</th>
                      <th>Eligibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attStats.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.regNo.toLowerCase().includes(studentSearch.toLowerCase())).map(s => {
                      const allVals = SUBJECTS.flatMap(sub =>
                        [1,2,3].map(n => ciaMarks[s.id]?.[sub.id]?.[`cia${n}`]).filter(v=>v!==""&&v!==undefined).map(Number)
                      );
                      const avg = allVals.length ? Math.round(allVals.reduce((a,b)=>a+b,0)/allVals.length) : null;
                      const pc  = s.pct>=75?"#4ade80":s.pct>=50?"#fbbf24":"#f87171";
                      return (
                        <tr key={s.id}>
                          <td className="lft"><div style={{ fontWeight:600, fontSize:14 }}>{s.name}</div><div style={{ fontSize:11, color:"rgba(255,255,255,.3)" }}>{s.dept}</div></td>
                          <td className="lft"><span style={{ fontFamily:"'Fira Code',monospace", fontSize:13, color:"#f59e0b" }}>{s.regNo}</span></td>
                          <td>
                            <div style={{ fontWeight:700, color:pc, fontFamily:"'Fira Code',monospace", fontSize:13 }}>{s.pct}%</div>
                            <div style={{ width:54, height:4, background:"rgba(255,255,255,.06)", borderRadius:3, margin:"4px auto 0" }}>
                              <div style={{ width:`${s.pct}%`, height:"100%", background:pc, borderRadius:3 }} />
                            </div>
                          </td>
                          <td>
                            <span style={{ fontFamily:"'Fira Code',monospace", fontSize:13, color:avg!==null?"#f59e0b":"rgba(255,255,255,.25)" }}>
                              {avg!==null?`${avg}/50`:"—"}
                            </span>
                          </td>
                          <td>
                            <span className="chip" style={{ background:s.pct>=75?"rgba(74,222,128,.1)":"rgba(248,113,113,.1)", color:s.pct>=75?"#4ade80":"#f87171", border:`1px solid ${s.pct>=75?"rgba(74,222,128,.3)":"rgba(248,113,113,.3)"}` }}>
                              {s.pct>=75?"ELIGIBLE":"SHORT"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>)}

          </div>{/* /content */}
        </div>{/* /main */}

        {/* ── Toast ─── */}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
