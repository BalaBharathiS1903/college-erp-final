import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { loadStudentFees, saveStudentFees } from "../utils/feeStore";
import { loadAllUsers } from "../utils/userStore";
import { loadCollegeConfig } from "../utils/collegeStore";
import { loadCIAMarks, loadSemMarks } from "../utils/staffStore";

/* ─── helpers ─────────────────────────────────────────────── */
function grade(v) {
  if (v === null || v === "" || v === undefined) return "—";
  const n = Number(v);
  if (isNaN(n)) return "—";
  if (n >= 90) return "O";
  if (n >= 80) return "A+";
  if (n >= 70) return "A";
  if (n >= 60) return "B+";
  if (n >= 50) return "B";
  return "F";
}
const GRADE_COLOR = { O:"#4ade80","A+":"#34d399",A:"#60a5fa","B+":"#a78bfa",B:"#fbbf24",F:"#f87171","—":"#94a3b8" };
function gradeColor(g) { return GRADE_COLOR[g] || "#94a3b8"; }
function bestTwo(a, b, c) {
  return [a, b, c].filter(v => v !== null && v !== "" && !isNaN(v))
    .map(Number).sort((x, y) => y - x).slice(0, 2).reduce((s, v) => s + v, 0);
}
function calcGPA(subs) {
  const v = subs.filter(s => s.semMark !== null && s.semMark !== "" && !isNaN(s.semMark));
  if (!v.length) return null;
  const pts = v.reduce((s, sub) => {
    const g = grade(sub.semMark);
    const p = g==="O"?10:g==="A+"?9:g==="A"?8:g==="B+"?7:g==="B"?6:0;
    return s + p * (sub.credits || 3);
  }, 0);
  const cr = v.reduce((s, sub) => s + (sub.credits || 3), 0);
  return cr ? (pts / cr).toFixed(2) : null;
}

const NAV = [
  { id: "dashboard", icon: "🏠", label: "Dashboard" },
  { id: "marks",     icon: "📋", label: "Mark Statement" },
  { id: "attendance",icon: "✅", label: "Attendance" },
  { id: "fees",      icon: "💳", label: "Fee Payment" },
  { id: "profile",   icon: "👤", label: "My Profile" },
];

const DEFAULT_STUDENT = {
  name: "Student", username: "", dept: "CSE", batch: "2021-2025",
  sem: 6, phone: "", email: "", dob: "", advisor: "", address: "", id: null
};

export default function StudentDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  /* ── load student profile from store ── */
  const [STUDENT, setStudent] = useState(() => {
    const all = loadAllUsers();
    const db = all.find(u => u.username === user?.username);
    return db ? { ...DEFAULT_STUDENT, ...db } : { ...DEFAULT_STUDENT, name: user?.name || "Student", username: user?.username || "" };
  });

  /* ── state ── */
  const [tab, setTab]         = useState("dashboard");
  const [sidebar, setSidebar] = useState(true);
  const [viewSem, setViewSem] = useState(STUDENT.sem || 6);
  const [feeYear, setFeeYear] = useState("2024-25");
  const [fees, setFees]       = useState(() => loadStudentFees(user?.username));
  const [payModal, setPayModal] = useState(null);
  const [payMode, setPayMode]   = useState("Online");
  const [toast, setToast]       = useState("");
  const [semData, setSemData]   = useState({ sem: viewSem, subjects: [] });

  /* ── college config ── */
  const [allSubjects, setAllSubjects] = useState(() => loadCollegeConfig().subjects || []);

  /* refresh profile whenever user switches back to this page */
  useEffect(() => {
    const all = loadAllUsers();
    const db = all.find(u => u.username === user?.username);
    if (db) setStudent({ ...DEFAULT_STUDENT, ...db });
    setAllSubjects(loadCollegeConfig().subjects || []);
  }, [user?.username]);

  /* ── build marks data whenever viewSem or STUDENT changes ── */
  useEffect(() => {
    const semSubjects = allSubjects.filter(s => s.sem === viewSem);
    const built = semSubjects.map(sub => {
      const ciaStore = loadCIAMarks(sub.id) || {};
      const semStore = loadSemMarks(sub.id) || {};
      // Keys are stored as numeric student IDs
      const studentId = STUDENT.id;
      const ciaData = ciaStore[studentId] || {};
      const semMark = semStore[studentId] ?? null;
      return {
        ...sub,
        cia1: ciaData.cia1 ?? null,
        cia2: ciaData.cia2 ?? null,
        cia3: ciaData.cia3 ?? null,
        semMark: semMark !== "" ? semMark : null,
      };
    });
    setSemData({ sem: viewSem, subjects: built });
  }, [viewSem, allSubjects, STUDENT.id]);

  /* ── fees refresh ── */
  useEffect(() => {
    setFees(loadStudentFees(user?.username));
  }, [user?.username]);

  /* ── derived values ── */
  const gpa = calcGPA(semData.subjects);
  const filteredFees = fees.filter(f => f.year === feeYear);
  const totalAllocated = filteredFees.reduce((s, f) => s + f.allocated, 0);
  const totalPaid = filteredFees.reduce((s, f) => s + f.paid, 0);
  const totalDue = totalAllocated - totalPaid;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const handlePay = () => {
    if (!payModal) return;
    const receipt = {
      no: `RCP${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      amount: payModal.allocated - payModal.paid,
      mode: payMode,
    };
    const updated = fees.map(f => f.id === payModal.id ? { ...f, paid: f.allocated, receipts: [...f.receipts, receipt] } : f);
    setFees(updated);
    saveStudentFees(user?.username, updated);
    setPayModal(null);
    showToast("✅ Payment successful!");
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  /* ── PDF download ── */
  const downloadMarksPDF = () => {
    const rows = semData.subjects.map(s => {
      const b2 = bestTwo(s.cia1, s.cia2, s.cia3);
      const sc = Math.round((b2 / 100) * 25);
      const tot = s.semMark !== null ? sc + Number(s.semMark) : null;
      const g = grade(s.semMark);
      return `<tr><td>${s.code}</td><td>${s.name}</td><td>${s.cia1??'—'}</td><td>${s.cia2??'—'}</td><td>${s.cia3??'—'}</td><td>${sc}</td><td>${s.semMark??'—'}</td><td>${tot??'—'}</td><td style="color:${gradeColor(g)}">${g}</td><td>${s.semMark!==null?(Number(s.semMark)>=50?'PASS':'FAIL'):'—'}</td></tr>`;
    }).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Mark Statement</title><style>body{font-family:Arial;padding:30px;font-size:13px}table{width:100%;border-collapse:collapse}th{background:#0f172a;color:#fff;padding:8px;text-align:center}td{padding:8px;border-bottom:1px solid #e2e8f0;text-align:center}td:nth-child(2){text-align:left}.h{text-align:center;margin-bottom:20px}</style></head><body><div class="h"><h2>BHC ERP — Mark Statement</h2><p>Semester ${viewSem} · ${STUDENT.name} · ${STUDENT.username}</p></div><table><thead><tr><th>Code</th><th>Subject</th><th>CIA1</th><th>CIA2</th><th>CIA3</th><th>CIA/25</th><th>Sem/100</th><th>Total</th><th>Grade</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table>${gpa ? `<p style="text-align:right;margin-top:12px;font-weight:700">SGPA: ${gpa}</p>` : ""}</body></html>`;
    const w = window.open("", "_blank"); w.document.write(html); w.document.close(); w.print();
  };

  const downloadReceiptPDF = (fee, receipt) => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt</title><style>body{font-family:Arial;padding:40px;font-size:13px;max-width:600px;margin:auto}h2{text-align:center}table{width:100%;border-collapse:collapse;margin:20px 0}td{padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px}td:first-child{color:#64748b;width:40%}td:last-child{font-weight:700}.paid{text-align:center;font-size:24px;font-weight:900;color:#16a34a;border:3px solid #16a34a;display:inline-block;padding:6px 20px;border-radius:8px;transform:rotate(-8deg);margin:20px auto}</style></head><body><h2>BHC ERP — Fee Receipt</h2><table><tr><td>Student</td><td>${STUDENT.name}</td></tr><tr><td>Register No.</td><td>${STUDENT.username}</td></tr><tr><td>Fee Type</td><td>${fee.type}</td></tr><tr><td>Academic Year</td><td>${fee.year}</td></tr><tr><td>Receipt No.</td><td>${receipt.no}</td></tr><tr><td>Date</td><td>${receipt.date}</td></tr><tr><td>Mode</td><td>${receipt.mode}</td></tr><tr><td>Amount</td><td style="font-size:18px;color:#15803d">₹${receipt.amount.toLocaleString("en-IN")}</td></tr></table><div style="text-align:center"><div class="paid">PAID</div></div></body></html>`;
    const w = window.open("", "_blank"); w.document.write(html); w.document.close(); w.print();
  };

  /* ══════════════════════════════════════════════════════════════
   *  Render
   * ════════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#14b8a630;border-radius:4px}
        .sd-root{display:flex;min-height:100vh;background:#f8fafc;font-family:'Plus Jakarta Sans',sans-serif;color:#0f172a}
        /* sidebar */
        .sd-sb{width:240px;min-height:100vh;background:#0f172a;color:#fff;display:flex;flex-direction:column;flex-shrink:0;transition:width .25s}
        .sd-sb.cl{width:64px}
        .sd-sb-brand{display:flex;align-items:center;gap:12px;padding:24px 20px 18px;border-bottom:1px solid rgba(255,255,255,.07)}
        .sd-sb-logo{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#14b8a6,#0ea5e9);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:18px}
        .sd-sb-title{font-size:15px;font-weight:800;white-space:nowrap;overflow:hidden}
        .sd-sb-sub{font-size:10px;color:rgba(255,255,255,.4);font-weight:500}
        .sd-nav{flex:1;padding:12px 10px;display:flex;flex-direction:column;gap:3px}
        .sd-nav-btn{display:flex;align-items:center;gap:12px;padding:10px 12px;border:none;border-radius:10px;background:transparent;color:rgba(255,255,255,.5);cursor:pointer;font-size:13px;font-weight:600;font-family:'Plus Jakarta Sans',sans-serif;width:100%;text-align:left;transition:.18s;white-space:nowrap;overflow:hidden}
        .sd-nav-btn:hover{color:#fff;background:rgba(255,255,255,.06)}
        .sd-nav-btn.on{color:#fff;background:linear-gradient(135deg,rgba(20,184,166,.2),rgba(14,165,233,.15));border:1px solid rgba(20,184,166,.3)}
        .sd-nav-icon{font-size:17px;flex-shrink:0}
        .sd-sb-foot{padding:16px 12px;border-top:1px solid rgba(255,255,255,.07)}
        /* topbar */
        .sd-topbar{height:58px;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;padding:0 28px;flex-shrink:0;box-shadow:0 1px 3px rgba(0,0,0,.04)}
        .sd-menu-btn{width:32px;height:32px;border-radius:8px;border:1.5px solid #e2e8f0;background:#fff;cursor:pointer;font-size:14px;color:#64748b}
        .sd-main{flex:1;display:flex;flex-direction:column;overflow:hidden}
        .sd-content{flex:1;overflow-y:auto;padding:28px}
        /* cards */
        .sd-cards{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
        @media(max-width:960px){.sd-cards{grid-template-columns:repeat(2,1fr)}}
        .sd-card{background:#fff;border-radius:16px;padding:20px;border:1px solid #e8f4f3;box-shadow:0 2px 8px rgba(0,0,0,.04)}
        .sd-card-lbl{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px}
        .sd-card-val{font-size:26px;font-weight:800;font-family:'JetBrains Mono',monospace}
        /* section */
        .sd-sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}
        .sd-sec-title{font-size:17px;font-weight:800}
        .sd-sec-sub{font-size:11px;color:#94a3b8;margin-top:3px}
        /* table */
        .sd-tbl-wrap{background:#fff;border:1px solid #e8f4f3;border-radius:16px;overflow:hidden}
        .sd-tbl{width:100%;border-collapse:collapse}
        .sd-tbl th{padding:11px 16px;text-align:center;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;background:#f8fffe;border-bottom:1px solid #e8f4f3}
        .sd-tbl th.lft{text-align:left}
        .sd-tbl td{padding:12px 16px;border-bottom:1px solid #f0fafa;text-align:center;font-size:13px;color:#0f172a}
        .sd-tbl td.lft{text-align:left}
        .sd-tbl tr:last-child td{border-bottom:none}
        .sd-tbl tr:hover td{background:#f8fffe}
        /* buttons */
        .btn-teal{background:linear-gradient(135deg,#14b8a6,#0ea5e9);border:none;color:#fff;padding:9px 18px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;display:inline-flex;align-items:center;gap:6px}
        .btn-outline{background:#fff;border:1.5px solid #e2e8f0;color:#64748b;padding:7px 14px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer}
        .btn-pay{background:linear-gradient(135deg,#22c55e,#16a34a);border:none;color:#fff;padding:8px 16px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer}
        /* chip */
        .chip{display:inline-block;padding:3px 10px;border-radius:6px;font-size:11px;font-weight:700}
        /* sem tabs */
        .sd-sem-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px}
        .sd-sem-tab{padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;border:1.5px solid #e2e8f0;background:#fff;color:#94a3b8;transition:.15s}
        .sd-sem-tab.on{background:linear-gradient(135deg,#14b8a6,#0ea5e9);border-color:transparent;color:#fff}
        /* fee */
        .sd-fee-card{background:#fff;border:1px solid #e8f4f3;border-radius:14px;padding:20px;margin-bottom:14px}
        .sd-receipt-row{display:flex;align-items:center;justify-content:space-between;background:#f8fffe;border:1px solid #e8f4f3;border-radius:9px;padding:9px 14px;margin-top:8px}
        /* profile */
        .sd-prof-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}
        @media(max-width:600px){.sd-prof-grid{grid-template-columns:1fr}}
        .sd-prof-row{background:#f8fffe;border-radius:10px;padding:12px 14px;border:1px solid #e8f4f3}
        .sd-prof-lbl{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:4px}
        .sd-prof-val{font-size:14px;font-weight:700;color:#0f172a}
        /* modal */
        .sd-modal-bg{position:fixed;inset:0;background:rgba(15,23,42,.7);backdrop-filter:blur(6px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px}
        .sd-modal{background:#fff;border-radius:20px;padding:30px;width:100%;max-width:440px;box-shadow:0 30px 60px rgba(0,0,0,.2)}
        .sd-mode-btn{flex:1;padding:9px;border-radius:9px;border:1.5px solid #e2e8f0;background:#fff;font-size:12px;font-weight:700;cursor:pointer;color:#64748b;transition:.15s}
        .sd-mode-btn.on{border-color:#14b8a6;background:#f0fdfc;color:#0d9488}
        /* toast */
        .sd-toast{position:fixed;bottom:28px;right:28px;background:linear-gradient(135deg,#14b8a6,#0ea5e9);color:#fff;padding:12px 22px;border-radius:12px;font-weight:700;font-size:14px;z-index:2000;animation:sdFadeUp .3s ease}
        @keyframes sdFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        /* gpa banner */
        .sd-gpa-banner{background:#0f172a;border-radius:14px;padding:20px 24px;margin-bottom:18px;display:flex;justify-content:space-between;align-items:center;color:#fff}
        /* empty state */
        .sd-empty{text-align:center;padding:60px 20px;color:#94a3b8}
        .sd-empty-icon{font-size:40px;margin-bottom:12px}
        /* mk */
        .mk{font-family:'JetBrains Mono',monospace;font-weight:600;font-size:14px}
        /* name */
        .sn{font-weight:700;font-size:13px;color:#0f172a}
        .sr{font-size:11px;color:#94a3b8;margin-top:2px}
      `}</style>

      <div className="sd-root">
        {/* ── Sidebar ── */}
        <aside className={`sd-sb ${sidebar ? "" : "cl"}`}>
          <div className="sd-sb-brand">
            <div className="sd-sb-logo">🎓</div>
            {sidebar && <div><div className="sd-sb-title">BHC ERP</div><div className="sd-sb-sub">Student Portal</div></div>}
          </div>
          <nav className="sd-nav">
            {NAV.map(n => (
              <button key={n.id} className={`sd-nav-btn ${tab === n.id ? "on" : ""}`} onClick={() => setTab(n.id)}>
                <span className="sd-nav-icon">{n.icon}</span>
                {sidebar && <span>{n.label}</span>}
              </button>
            ))}
          </nav>
          <div className="sd-sb-foot">
            <button onClick={handleLogout} style={{ width:"100%", background:"rgba(239,68,68,.1)", border:"1.5px solid rgba(239,68,68,.25)", color:"#ef4444", padding:"8px", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
              {sidebar ? "🚪 Logout" : "🚪"}
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="sd-main">
          <div className="sd-topbar">
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <button className="sd-menu-btn" onClick={() => setSidebar(s => !s)}>☰</button>
              <span style={{ fontWeight:800, fontSize:16 }}>{NAV.find(n => n.id === tab)?.label}</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ background:"rgba(20,184,166,.1)", border:"1px solid rgba(20,184,166,.25)", color:"#0d9488", fontSize:11, fontWeight:700, padding:"3px 11px", borderRadius:20 }}>
                Sem {STUDENT.sem || 6} · {STUDENT.dept || "CSE"}
              </span>
              <span style={{ fontWeight:700, fontSize:13 }}>{STUDENT.name}</span>
            </div>
          </div>

          <div className="sd-content">

            {/* ══ DASHBOARD ══════════════════════════════════ */}
            {tab === "dashboard" && (<>
              <div className="sd-cards">
                {[
                  { lbl: "Current Semester", val: STUDENT.sem || 6, clr: "#14b8a6" },
                  { lbl: "Department", val: STUDENT.dept || "CSE", clr: "#0ea5e9" },
                  { lbl: "Fee Balance", val: `₹${totalDue.toLocaleString("en-IN")}`, clr: totalDue > 0 ? "#ef4444" : "#22c55e" },
                  { lbl: "SGPA", val: gpa || "—", clr: "#a78bfa" },
                ].map(c => (
                  <div className="sd-card" key={c.lbl}>
                    <div className="sd-card-lbl">{c.lbl}</div>
                    <div className="sd-card-val" style={{ color: c.clr }}>{c.val}</div>
                  </div>
                ))}
              </div>
              <div className="sd-sec-hd">
                <div><div className="sd-sec-title">Current Semester Subjects</div><div className="sd-sec-sub">Semester {STUDENT.sem || 6}</div></div>
                <button className="btn-teal" onClick={() => setTab("marks")}>View Marks →</button>
              </div>
              {semData.subjects.length === 0 ? (
                <div className="sd-empty"><div className="sd-empty-icon">📚</div><div style={{ fontWeight:700 }}>No subjects found for Semester {STUDENT.sem}</div><div style={{ fontSize:12, marginTop:4 }}>Check with admin if subjects have been configured.</div></div>
              ) : (
                <div className="sd-tbl-wrap">
                  <table className="sd-tbl">
                    <thead><tr><th className="lft">Subject</th><th>CIA 1</th><th>CIA 2</th><th>CIA 3</th><th>Sem Mark</th><th>Grade</th></tr></thead>
                    <tbody>
                      {semData.subjects.map(s => {
                        const g = grade(s.semMark);
                        return (
                          <tr key={s.id}>
                            <td className="lft"><div className="sn">{s.name}</div><div className="sr">{s.code}</div></td>
                            <td><span className="mk" style={{ color: s.cia1 !== null ? (Number(s.cia1) >= 25 ? "#22c55e" : "#ef4444") : "#94a3b8" }}>{s.cia1 !== null ? s.cia1 : "—"}</span></td>
                            <td><span className="mk" style={{ color: s.cia2 !== null ? (Number(s.cia2) >= 25 ? "#22c55e" : "#ef4444") : "#94a3b8" }}>{s.cia2 !== null ? s.cia2 : "—"}</span></td>
                            <td><span className="mk" style={{ color: s.cia3 !== null ? (Number(s.cia3) >= 25 ? "#22c55e" : "#ef4444") : "#94a3b8" }}>{s.cia3 !== null ? s.cia3 : "—"}</span></td>
                            <td><span className="mk" style={{ color: s.semMark !== null ? (Number(s.semMark) >= 50 ? "#22c55e" : "#ef4444") : "#94a3b8" }}>{s.semMark !== null ? s.semMark : "—"}</span></td>
                            <td><span className="chip" style={{ background: `${gradeColor(g)}20`, color: gradeColor(g) }}>{g}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>)}

            {/* ══ MARK STATEMENT ═══════════════════════════ */}
            {tab === "marks" && (<>
              <div className="sd-sec-hd">
                <div><div className="sd-sec-title">Mark Statement</div><div className="sd-sec-sub">Semester-wise grades</div></div>
                {semData.subjects.length > 0 && <button className="btn-teal" onClick={downloadMarksPDF}>⬇ PDF</button>}
              </div>
              <div className="sd-sem-tabs">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                  <button key={n} className={`sd-sem-tab ${viewSem === n ? "on" : ""}`} onClick={() => setViewSem(n)}>Sem {n}</button>
                ))}
              </div>
              {gpa && (
                <div className="sd-gpa-banner">
                  <div>
                    <div style={{ fontSize:11, color:"rgba(255,255,255,.5)", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Semester {viewSem} · SGPA</div>
                    <div style={{ fontSize:32, fontWeight:800, color:"#14b8a6", fontFamily:"'JetBrains Mono',monospace" }}>{gpa}</div>
                  </div>
                  <div style={{ display:"flex", gap:14 }}>
                    {["O","A+","A","B+","B","F"].map(g => (
                      <div key={g} style={{ textAlign:"center" }}>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", marginBottom:2 }}>{g}</div>
                        <div style={{ fontSize:15, fontWeight:700, color: gradeColor(g) }}>{semData.subjects.filter(s => grade(s.semMark) === g).length}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {semData.subjects.length === 0 ? (
                <div className="sd-empty"><div className="sd-empty-icon">📋</div><div style={{ fontWeight:700 }}>No marks yet for Semester {viewSem}</div></div>
              ) : (
                <div className="sd-tbl-wrap" style={{ overflowX:"auto" }}>
                  <table className="sd-tbl" style={{ minWidth:700 }}>
                    <thead>
                      <tr>
                        <th className="lft">Subject</th>
                        <th>CIA 1<span style={{ opacity:.5, fontWeight:400 }}>/50</span></th>
                        <th>CIA 2<span style={{ opacity:.5, fontWeight:400 }}>/50</span></th>
                        <th>CIA 3<span style={{ opacity:.5, fontWeight:400 }}>/50</span></th>
                        <th>CIA/25</th>
                        <th>Sem<span style={{ opacity:.5, fontWeight:400 }}>/100</span></th>
                        <th>Total</th>
                        <th>Grade</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semData.subjects.map(s => {
                        const b2 = bestTwo(s.cia1, s.cia2, s.cia3);
                        const sc = Math.round((b2 / 100) * 25);
                        const tot = s.semMark !== null ? sc + Number(s.semMark) : null;
                        const g = grade(s.semMark);
                        const pass = s.semMark !== null && Number(s.semMark) >= 50;
                        return (
                          <tr key={s.id}>
                            <td className="lft"><div className="sn">{s.name}</div><div className="sr">{s.code} · {s.credits}cr</div></td>
                            {[s.cia1, s.cia2, s.cia3].map((v, i) => (
                              <td key={i}><span className="mk" style={{ color: v !== null ? (Number(v) >= 25 ? "#22c55e" : "#ef4444") : "#94a3b8" }}>{v !== null ? v : "—"}</span></td>
                            ))}
                            <td><span className="mk" style={{ color:"#f59e0b" }}>{sc}</span></td>
                            <td><span className="mk" style={{ color: s.semMark !== null ? (Number(s.semMark) >= 50 ? "#22c55e" : "#ef4444") : "#94a3b8" }}>{s.semMark !== null ? s.semMark : "—"}</span></td>
                            <td><span className="mk" style={{ fontWeight:800 }}>{tot !== null ? tot : "—"}</span></td>
                            <td><span className="chip" style={{ background:`${gradeColor(g)}20`, color:gradeColor(g), border:`1px solid ${gradeColor(g)}40` }}>{g}</span></td>
                            <td>
                              {s.semMark !== null
                                ? <span className="chip" style={{ background: pass ? "rgba(34,197,94,.1)" : "rgba(239,68,68,.1)", color: pass ? "#16a34a" : "#dc2626" }}>{pass ? "PASS" : "FAIL"}</span>
                                : <span style={{ fontSize:11, color:"#94a3b8" }}>Pending</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>)}

            {/* ══ ATTENDANCE ═══════════════════════════════ */}
            {tab === "attendance" && (<>
              <div className="sd-sec-hd"><div><div className="sd-sec-title">Attendance</div><div className="sd-sec-sub">Current Semester {STUDENT.sem || 6}</div></div></div>
              {allSubjects.filter(s => s.sem === (STUDENT.sem || 6)).length === 0 ? (
                <div className="sd-empty"><div className="sd-empty-icon">📊</div><div style={{ fontWeight:700 }}>No subjects configured for this semester</div></div>
              ) : (
                <div className="sd-tbl-wrap">
                  <table className="sd-tbl">
                    <thead><tr><th className="lft">Subject</th><th>Code</th><th>Credits</th><th>Status</th></tr></thead>
                    <tbody>
                      {allSubjects.filter(s => s.sem === (STUDENT.sem || 6)).map(s => (
                        <tr key={s.id}>
                          <td className="lft"><div className="sn">{s.name}</div></td>
                          <td><span className="mk" style={{ color:"#14b8a6" }}>{s.code}</span></td>
                          <td><span className="mk">{s.credits}</span></td>
                          <td><span className="chip" style={{ background:"rgba(14,165,233,.1)", color:"#0ea5e9" }}>Enrolled</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ marginTop:18, background:"#fff8f0", border:"1px solid #fed7aa", borderRadius:12, padding:"12px 16px", fontSize:13, color:"#c2410c" }}>
                ℹ️ Detailed hour-by-hour attendance is recorded by staff in the Staff Portal. Contact your staff for attendance details.
              </div>
            </>)}

            {/* ══ FEES ═════════════════════════════════════ */}
            {tab === "fees" && (<>
              <div className="sd-sec-hd">
                <div><div className="sd-sec-title">Fee Payment</div><div className="sd-sec-sub">View and pay your fees</div></div>
                <select value={feeYear} onChange={e => setFeeYear(e.target.value)} style={{ background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:9, padding:"7px 14px", fontSize:13, fontWeight:600, color:"#0f172a", outline:"none", cursor:"pointer" }}>
                  <option value="2024-25">2024–25</option>
                  <option value="2023-24">2023–24</option>
                </select>
              </div>
              {/* Summary cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:22 }}>
                {[
                  { lbl:"Total Allocated", val:`₹${totalAllocated.toLocaleString("en-IN")}`, clr:"#0ea5e9" },
                  { lbl:"Total Paid",      val:`₹${totalPaid.toLocaleString("en-IN")}`,      clr:"#22c55e" },
                  { lbl:"Balance Due",     val:`₹${totalDue.toLocaleString("en-IN")}`,       clr: totalDue > 0 ? "#ef4444" : "#22c55e" },
                ].map(c => (
                  <div className="sd-card" key={c.lbl}><div className="sd-card-lbl">{c.lbl}</div><div className="sd-card-val" style={{ color:c.clr, fontSize:20 }}>{c.val}</div></div>
                ))}
              </div>
              {filteredFees.length === 0 ? (
                <div className="sd-empty"><div className="sd-empty-icon">💳</div><div style={{ fontWeight:700 }}>No fee records for {feeYear}</div><div style={{ fontSize:12, marginTop:4 }}>Contact Admin to allocate fees.</div></div>
              ) : filteredFees.map(f => {
                const bal = f.allocated - f.paid;
                const pct = Math.round((f.paid / f.allocated) * 100);
                const pc = pct === 100 ? "#22c55e" : pct > 50 ? "#f59e0b" : "#ef4444";
                return (
                  <div className="sd-fee-card" key={f.id}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                      <div><div style={{ fontSize:15, fontWeight:800 }}>{f.type}</div><div style={{ fontSize:11, color:"#94a3b8", marginTop:2 }}>AY {f.year}</div></div>
                      <span className="chip" style={{ background: bal===0?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)", color: bal===0?"#16a34a":"#dc2626" }}>{bal===0?"PAID":"PENDING"}</span>
                    </div>
                    <div style={{ display:"flex", gap:22, marginBottom:10 }}>
                      <div><div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, marginBottom:2 }}>ALLOCATED</div><div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:15 }}>₹{f.allocated.toLocaleString("en-IN")}</div></div>
                      <div><div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, marginBottom:2 }}>PAID</div><div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:15, color:"#22c55e" }}>₹{f.paid.toLocaleString("en-IN")}</div></div>
                      {bal > 0 && <div><div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, marginBottom:2 }}>DUE</div><div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:15, color:"#ef4444" }}>₹{bal.toLocaleString("en-IN")}</div></div>}
                    </div>
                    <div style={{ height:5, background:"#e8f4f3", borderRadius:3, overflow:"hidden", marginBottom:10 }}>
                      <div style={{ width:`${pct}%`, height:"100%", background:pc, borderRadius:3, transition:"width .5s" }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontSize:12, color:"#94a3b8" }}>{pct}% paid</span>
                      {bal > 0 && <button className="btn-pay" onClick={() => setPayModal(f)}>Pay ₹{bal.toLocaleString("en-IN")} →</button>}
                    </div>
                    {f.receipts.length > 0 && (
                      <div style={{ marginTop:12 }}>
                        <div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:6 }}>Receipts</div>
                        {f.receipts.map(r => (
                          <div className="sd-receipt-row" key={r.no}>
                            <div><div style={{ fontSize:12, fontWeight:700 }}>{r.no}</div><div style={{ fontSize:10, color:"#94a3b8" }}>{r.date} · {r.mode}</div></div>
                            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:"#22c55e", fontSize:13 }}>₹{r.amount.toLocaleString("en-IN")}</span>
                              <button className="btn-outline" style={{ padding:"4px 10px", fontSize:11 }} onClick={() => downloadReceiptPDF(f, r)}>⬇ Receipt</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>)}

            {/* ══ PROFILE ══════════════════════════════════ */}
            {tab === "profile" && (<>
              <div className="sd-sec-hd"><div className="sd-sec-title">My Profile</div></div>
              <div style={{ background:"#fff", border:"1px solid #e8f4f3", borderRadius:16, padding:24, boxShadow:"0 2px 8px rgba(0,0,0,.04)", marginBottom:20 }}>
                <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:20 }}>
                  <div style={{ width:60, height:60, borderRadius:14, background:"linear-gradient(135deg,#14b8a6,#0ea5e9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🎓</div>
                  <div>
                    <div style={{ fontSize:20, fontWeight:800 }}>{STUDENT.name}</div>
                    <div style={{ fontSize:13, color:"#94a3b8", marginTop:2 }}>{STUDENT.dept} · Sem {STUDENT.sem}</div>
                  </div>
                </div>
                <div className="sd-prof-grid">
                  {[
                    { lbl:"Register No.",       val: STUDENT.username || STUDENT.regNo },
                    { lbl:"Batch",              val: STUDENT.batch },
                    { lbl:"Department",         val: STUDENT.dept },
                    { lbl:"Current Semester",   val: `Semester ${STUDENT.sem}` },
                    { lbl:"Email",              val: STUDENT.email },
                    { lbl:"Phone",              val: STUDENT.phone },
                    { lbl:"Date of Birth",      val: STUDENT.dob },
                    { lbl:"Faculty Advisor",    val: STUDENT.advisor },
                    { lbl:"Home Address",       val: STUDENT.address },
                  ].map(r => (
                    <div className="sd-prof-row" key={r.lbl}>
                      <div className="sd-prof-lbl">{r.lbl}</div>
                      <div className="sd-prof-val">{r.val || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>)}

          </div>{/* /content */}
        </div>{/* /main */}

        {/* ── Pay Modal ── */}
        {payModal && (
          <div className="sd-modal-bg" onClick={() => setPayModal(null)}>
            <div className="sd-modal" onClick={e => e.stopPropagation()}>
              <div style={{ fontWeight:800, fontSize:18, marginBottom:16 }}>Complete Payment</div>
              <div style={{ background:"#f8fafc", borderRadius:12, padding:14, marginBottom:18 }}>
                {[["Fee Type", payModal.type], ["Academic Year", payModal.year], ["Student", STUDENT.name], ["Register No.", STUDENT.username]].map(([l, v]) => (
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #f1f5f9", fontSize:13 }}>
                    <span style={{ color:"#64748b" }}>{l}</span><span style={{ fontWeight:700 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", fontSize:16 }}>
                  <span style={{ color:"#64748b" }}>Amount Due</span><span style={{ fontWeight:800, color:"#ef4444", fontFamily:"'JetBrains Mono',monospace" }}>₹{(payModal.allocated - payModal.paid).toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div style={{ fontSize:11, color:"#94a3b8", fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Payment Mode</div>
              <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                {["Online","Cash","DD","Cheque"].map(m => (
                  <button key={m} className={`sd-mode-btn ${payMode === m ? "on" : ""}`} onClick={() => setPayMode(m)}>{m}</button>
                ))}
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button style={{ flex:1, padding:11, borderRadius:10, border:"1.5px solid #e2e8f0", background:"#fff", color:"#64748b", fontSize:13, fontWeight:600, cursor:"pointer" }} onClick={() => setPayModal(null)}>Cancel</button>
                <button style={{ flex:2, padding:11, borderRadius:10, border:"none", background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }} onClick={handlePay}>Confirm Payment ✓</button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="sd-toast">{toast}</div>}
      </div>
    </>
  );
}
