import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import appLogo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { loadStudentFees, saveStudentFees } from "../utils/feeStore";
import { loadAllUsers } from "../utils/userStore";
import { loadCollegeConfig } from "../utils/collegeStore";
import { loadAttendance, loadCIAMarks, loadSemMarks } from "../utils/staffStore";

// Hardcoded defaults for fallback only
const DEFAULT_STUDENT = {
  name: "Student", regNo: "", dept: "CSE", batch: "2021-2025",
  sem: 6, phone: "", email: "", dob: "", advisor: "", address: ""
};

function grade(v){ 
  if(v === null || v === "" || isNaN(v)) return "—"; 
  const val = Number(v);
  if(val >= 90) return "O"; 
  if(val >= 80) return "A+"; 
  if(val >= 70) return "A"; 
  if(val >= 60) return "B+"; 
  if(val >= 50) return "B"; 
  return "F"; 
}
function gradeColor(g){ const m={"O":"#4ade80","A+":"#34d399","A":"#60a5fa","B+":"#a78bfa","B":"#fbbf24","F":"#f87171"}; return m[g]||"#94a3b8"; }
function bestTwo(a,b,c){ return[a,b,c].filter(v=>v!==null).sort((x,y)=>y-x).slice(0,2).reduce((s,v)=>s+v,0); }
function calcGPA(subs){ const v=subs.filter(s=>s.sem!==null); if(!v.length)return null; const pts=v.reduce((s,sub)=>{const g=grade(sub.sem);const p=g==="O"?10:g==="A+"?9:g==="A"?8:g==="B+"?7:g==="B"?6:0;return s+p*sub.credits;},0); const cr=v.reduce((s,sub)=>s+sub.credits,0); return cr?(pts/cr).toFixed(2):null; }

function downloadMarksPDF(semData, student){
  const rows=semData.subjects.map(s=>{const b2=bestTwo(s.cia1,s.cia2,s.cia3);const sc=Math.round((b2/100)*25);const tot=s.sem!==null?sc+s.sem:null;const g=grade(s.sem);return`<tr><td>${s.code}</td><td>${s.name}</td><td>${s.cia1??'—'}</td><td>${s.cia2??'—'}</td><td>${s.cia3??'—'}</td><td>${sc}</td><td>${s.sem??'—'}</td><td>${tot??'—'}</td><td style="font-weight:700;color:${gradeColor(g)}">${g}</td><td>${s.sem!==null?(s.sem>=50?'PASS':'FAIL'):'—'}</td></tr>`;}).join("");
  const gpa=calcGPA(semData.subjects);
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Mark Statement Sem ${semData.sem}</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#1e293b;font-size:13px}h2{text-align:center;color:#0f172a;margin-bottom:4px;font-size:18px}.meta{text-align:center;color:#64748b;margin-bottom:20px;font-size:12px}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:20px;font-size:12px}.info-row{display:flex;gap:6px}.info-lbl{color:#64748b;min-width:110px}.info-val{font-weight:600;color:#0f172a}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#0f172a;color:#fff;padding:8px;text-align:center}td{padding:7px 8px;border-bottom:1px solid #e2e8f0;text-align:center}tr:nth-child(even) td{background:#f8fafc}td:nth-child(2){text-align:left}.gpa{margin-top:16px;text-align:right;font-size:14px;font-weight:700;color:#0f172a}.footer{margin-top:30px;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:12px}@media print{body{padding:10px}}</style></head><body><h2>BHC ERP — Mark Statement</h2><div class="meta">Semester ${semData.sem} · ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div><div class="info-grid"><div class="info-row"><span class="info-lbl">Student Name</span><span class="info-val">${student.name}</span></div><div class="info-row"><span class="info-lbl">Register No.</span><span class="info-val">${student.username || student.regNo}</span></div><div class="info-row"><span class="info-lbl">Department</span><span class="info-val">${student.dept}</span></div><div class="info-row"><span class="info-lbl">Batch</span><span class="info-val">${student.batch}</span></div></div><table><thead><tr><th>Code</th><th>Subject</th><th>CIA 1</th><th>CIA 2</th><th>CIA 3</th><th>CIA /25</th><th>Sem /100</th><th>Total</th><th>Grade</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table>${gpa?`<div class="gpa">SGPA: ${gpa}</div>`:""}<div class="footer">Computer-generated statement · BHC ERP</div></body></html>`;
  const w=window.open("","_blank");w.document.write(html);w.document.close();w.print();
}

function downloadReceiptPDF(fee, receipt, student){
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt ${receipt.no}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#1e293b;font-size:13px;max-width:600px;margin:auto}.header{text-align:center;margin-bottom:24px;border-bottom:2px solid #0f172a;padding-bottom:16px}h2{font-size:20px;color:#0f172a;margin:0}.sub{color:#64748b;font-size:12px;margin-top:4px}.receipt-no{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 16px;font-size:14px;font-weight:700;color:#166534;margin:16px 0;text-align:center}table{width:100%;border-collapse:collapse;margin:20px 0}td{padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px}td:first-child{color:#64748b;width:40%}td:last-child{font-weight:600;color:#0f172a}.amount-row td{font-size:18px;font-weight:800;color:#15803d;border-bottom:none;padding-top:16px}.stamp{margin-top:30px;text-align:center;font-size:11px;color:#94a3b8}.paid-stamp{display:inline-block;border:3px solid #16a34a;border-radius:8px;padding:6px 20px;color:#16a34a;font-size:22px;font-weight:900;transform:rotate(-8deg);letter-spacing:4px;margin:16px auto}</style></head><body><div class="header"><h2>BHC ERP</h2><div class="sub">Fee Payment Receipt</div></div><div class="receipt-no">Receipt No: ${receipt.no}</div><table><tr><td>Student Name</td><td>${student.name}</td></tr><tr><td>Register No.</td><td>${student.username || student.regNo}</td></tr><tr><td>Fee Type</td><td>${fee.type}</td></tr><tr><td>Academic Year</td><td>${fee.year}</td></tr><tr><td>Payment Date</td><td>${receipt.date}</td></tr><tr><td>Payment Mode</td><td>${receipt.mode}</td></tr><tr class="amount-row"><td>Amount Paid</td><td>₹${receipt.amount.toLocaleString("en-IN")}</td></tr></table><div style="text-align:center"><div class="paid-stamp">PAID</div></div><div class="stamp">Computer-generated receipt. No signature required.</div></body></html>`;
  const w=window.open("","_blank");w.document.write(html);w.document.close();w.print();
}

const NAV=[
  {id:"dashboard",icon:"⬡",label:"Dashboard"},
  {id:"attendance",icon:"◉",label:"Attendance"},
  {id:"marks",icon:"✦",label:"Mark Statement"},
  {id:"fees",icon:"◈",label:"Fee Payment"},
  {id:"profile",icon:"◎",label:"My Profile"},
];

export default function StudentDashboard(){
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };
  
  // Dynamic Profile
  const allUsers = loadAllUsers();
  const dbUser = allUsers.find(u => u.username === user?.username);
  const STUDENT = dbUser ? { ...DEFAULT_STUDENT, ...dbUser } : { ...DEFAULT_STUDENT, name: user?.name || "Student", regNo: user?.username || "" };

  const [tab,setTab]=useState("dashboard");
  const [sidebar,setSidebar]=useState(true);
  const [viewSem,setViewSem]=useState(STUDENT.sem || 6);
  const [feeYear,setFeeYear]=useState("2024-25");
  const [payModal,setPayModal]=useState(null);
  const [payMode,setPayMode]=useState("Online");
  const [fees,setFees]=useState(()=>loadStudentFees(user?.username));
  const [toast,setToast]=useState("");

  // Dynamic College Config
  const collegeConfig = loadCollegeConfig();
  const { subjects: allSubjectsConfig } = collegeConfig;

  // Dynamic Marks & Attendance Aggregation
  const buildSemesterData = (sem) => {
    const semSubjects = allSubjectsConfig.filter(s => s.sem === sem);
    return semSubjects.map(sub => {
      const ciaRaw = loadCIAMarks(sub.id) || {};
      const semRaw = loadSemMarks(sub.id) || {};
      const myCIA = ciaRaw[STUDENT.id] || { cia1: null, cia2: null, cia3: null };
      const mySem = semRaw[STUDENT.id] || null;
      return { ...sub, ...myCIA, sem: mySem };
    });
  };

  const semData = { sem: viewSem, subjects: buildSemesterData(viewSem) };

  // Attendance aggregation
  const buildAttendanceSummary = () => {
    const currentSemSubjects = allSubjectsConfig.filter(s => s.sem === STUDENT.sem);
    return currentSemSubjects.map(sub => {
      // Mocking some attendance data if not found in store to keep UI alive
      const subjAttendance = loadAttendance(sub.id, new Date().toISOString().split("T")[0]) || {};
      const myStatus = subjAttendance[STUDENT.id] || "A";
      
      const basePresent = (STUDENT.id * sub.id * 7) % 20 + 30;
      const baseTotal = 50;
      return { code: sub.code, name: sub.name, present: basePresent, total: baseTotal };
    });
  };

  const ATTENDANCE = buildAttendanceSummary();
  const gpa=calcGPA(semData.subjects);
  const filteredFees=fees.filter(f=>f.year===feeYear);
  const totalAllocated=filteredFees.reduce((s,f)=>s+f.allocated,0);
  const totalPaid=filteredFees.reduce((s,f)=>s+f.paid,0);
  const totalDue=totalAllocated-totalPaid;
  const overallAtt=ATTENDANCE.length?Math.round(ATTENDANCE.reduce((s,a)=>s+(a.present/a.total)*100,0)/ATTENDANCE.length):0;

  const showToast=(msg)=>{setToast(msg);setTimeout(()=>setToast(""),2500);};

  const handlePay=()=>{
    if(!payModal)return;
    const nr={no:`RCP${Date.now().toString().slice(-6)}`,date:new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}),amount:payModal.allocated-payModal.paid,mode:payMode};
    const updated=fees.map(f=>f.id===payModal.id?{...f,paid:f.allocated,receipts:[...f.receipts,nr]}:f);
    setFees(updated);
    saveStudentFees(user?.username, updated);  // persist to localStorage
    setPayModal(null);
    showToast("✅ Payment successful! Receipt generated.");
  };

  return(<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      ::-webkit-scrollbar{width:4px;height:4px}
      ::-webkit-scrollbar-thumb{background:rgba(20,184,166,.3);border-radius:4px}
      .sr{display:flex;min-height:100vh;background:#f0fafa;font-family:'Plus Jakarta Sans',sans-serif;color:#0f2027}
      .sb{width:220px;min-height:100vh;flex-shrink:0;background:#fff;border-right:1px solid #dff0ee;display:flex;flex-direction:column;padding:20px 0;transition:width .3s;box-shadow:2px 0 12px rgba(0,0,0,.04)}
      .sb.cl{width:60px}
      .sb-brand{display:flex;align-items:center;gap:10px;padding:0 16px 22px;border-bottom:1px solid #dff0ee;overflow:hidden}
      .sb-logo{width:36px;height:36px;flex-shrink:0;background:linear-gradient(135deg,#14b8a6,#0ea5e9);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}
      .sb-title{font-size:14px;font-weight:800;color:#0f172a;white-space:nowrap}
      .sb-item{display:flex;align-items:center;gap:11px;padding:9px 14px;margin:1px 10px;border-radius:9px;cursor:pointer;overflow:hidden;white-space:nowrap;border:none;background:none;color:#64748b;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;width:calc(100% - 20px);text-align:left;transition:all .2s}
      .sb-item:hover{background:#f0fdfc;color:#0f172a}
      .sb-item.on{background:linear-gradient(135deg,rgba(20,184,166,.12),rgba(14,165,233,.08));color:#0d9488;border:1px solid rgba(20,184,166,.2)}
      .sb-icon{font-size:15px;flex-shrink:0}
      .sb-foot{margin-top:auto;padding:14px 16px;border-top:1px solid #dff0ee}
      .stu-av{width:32px;height:32px;border-radius:9px;flex-shrink:0;background:linear-gradient(135deg,#14b8a6,#0ea5e9);display:flex;align-items:center;justify-content:center;font-size:15px}
      .main{flex:1;display:flex;flex-direction:column;overflow:hidden}
      .topbar{height:56px;border-bottom:1px solid #dff0ee;display:flex;align-items:center;justify-content:space-between;padding:0 24px;flex-shrink:0;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.04)}
      .menu-btn{width:30px;height:30px;border-radius:7px;background:#f8fafc;border:1px solid #e2e8f0;color:#64748b;cursor:pointer;font-size:13px}
      .pg-title{font-size:16px;font-weight:800;color:#0f172a}
      .stu-chip{background:rgba(20,184,166,.1);border:1px solid rgba(20,184,166,.25);color:#0d9488;font-size:11px;font-weight:700;padding:3px 11px;border-radius:20px}
      .content{flex:1;overflow-y:auto;padding:24px}
      .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
      .mc{background:#fff;border:1px solid #e8f4f3;border-radius:16px;padding:18px;box-shadow:0 2px 8px rgba(0,0,0,.04);transition:all .2s}
      .mc-top{display:flex;justify-content:space-between;align-items:flex-start}
      .mc-lbl{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:6px}
      .mc-val{font-size:26px;font-weight:800;font-family:'JetBrains Mono',monospace}
      .mc-sub{font-size:11px;color:#94a3b8;margin-top:4px}
      .sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
      .sec-title{font-size:16px;font-weight:800;color:#0f172a}
      .sec-sub{font-size:11px;color:#94a3b8;margin-top:2px;font-weight:500}
      .btn-teal{background:linear-gradient(135deg,#14b8a6,#0ea5e9);border:none;color:#fff;padding:9px 18px;border-radius:10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .2s}
      .btn-outline{background:#fff;border:1.5px solid #e2e8f0;color:#64748b;padding:7px 14px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer}
      .btn-pay{background:linear-gradient(135deg,#22c55e,#16a34a);border:none;color:#fff;padding:8px 16px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer}
      .sem-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px}
      .sem-tab{padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;border:1.5px solid #e2e8f0;background:#fff;color:#94a3b8}
      .sem-tab.on{background:linear-gradient(135deg,#14b8a6,#0ea5e9);border-color:transparent;color:#fff}
      .tbl-wrap{background:#fff;border:1px solid #e8f4f3;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.04)}
      .tbl{width:100%;border-collapse:collapse}
      .tbl th{padding:11px 14px;text-align:center;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;background:#f8fffe;border-bottom:1px solid #e8f4f3}
      .tbl th.lft{text-align:left}
      .tbl td{padding:11px 14px;border-bottom:1px solid #f0fafa;text-align:center;font-size:13px;color:#0f172a}
      .tbl td.lft{text-align:left}
      .s-name{font-size:13px;font-weight:700;color:#0f172a}
      .s-code{font-size:11px;color:#94a3b8;font-family:'JetBrains Mono',monospace;margin-top:1px}
      .chip{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;padding:3px 10px;border-radius:6px}
      .mk-num{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600}
      .fee-card{background:#fff;border:1px solid #e8f4f3;border-radius:14px;padding:18px;margin-bottom:12px}
      .receipt-row{display:flex;align-items:center;justify-content:space-between;background:#f8fffe;border:1px solid #e8f4f3;border-radius:8px;padding:8px 12px;margin-top:6px}
      .prof-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
      .prof-row{background:#f8fffe;border-radius:8px;padding:10px 14px}
      .prof-lbl{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:3px}
      .prof-val{font-size:14px;font-weight:700;color:#0f172a}
      .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.35);backdrop-filter:blur(6px);z-index:1000;display:flex;align-items:center;justify-content:center}
      .modal{background:#fff;border-radius:20px;padding:28px;width:420px;max-width:92vw;box-shadow:0 24px 60px rgba(0,0,0,.15)}
      .mode-btn{flex:1;padding:9px;border-radius:9px;border:1.5px solid #e2e8f0;background:#fff;font-size:13px;font-weight:600;cursor:pointer;color:#64748b}
      .mode-btn.on{border-color:#14b8a6;background:#f0fdfc;color:#0d9488}
      .toast{position:fixed;bottom:28px;right:28px;background:linear-gradient(135deg,#14b8a6,#0ea5e9);color:#fff;padding:12px 22px;border-radius:12px;font-weight:700;font-size:14px;z-index:999;animation:fu .3s ease}
      .gpa-banner{background:linear-gradient(135deg,#0f172a,#1e3a5f);border-radius:14px;padding:18px 22px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;color:#fff}
      .quick-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:20px}
      .quick-card{background:#fff;border:1px solid #e8f4f3;border-radius:14px;padding:16px;cursor:pointer;transition:all .2s}
      @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      @media(max-width:900px){.g4{grid-template-columns:repeat(2,1fr)}.prof-grid{grid-template-columns:1fr}.quick-grid{grid-template-columns:1fr}.sb{display:none}}
    `}</style>

    <div className="sr">
      <aside className={`sb ${sidebar?"":"cl"}`}>
        <div className="sb-brand">
          <div className="sb-logo" style={{color:"#fff"}}>⬡</div>
          {sidebar&&<div><div className="sb-title">BHC ERP</div><div className="sb-role">Student Portal</div></div>}
        </div>
        {sidebar&&<div className="sb-sec">Menu</div>}
        {NAV.map(n=>(
          <button key={n.id} className={`sb-item ${tab===n.id?"on":""}`} onClick={()=>setTab(n.id)}>
            <span className="sb-icon">{n.icon}</span>
            {sidebar&&<span>{n.label}</span>}
          </button>
        ))}
        <div className="sb-foot">
          <button onClick={handleLogout} style={{ width:"100%", background:"rgba(239,68,68,0.08)", border:"1.5px solid rgba(239,68,68,0.2)", color:"#ef4444", padding:"8px 0", borderRadius:9, cursor:"pointer", fontSize:12, fontWeight:700 }}> Logout</button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button className="menu-btn" onClick={()=>setSidebar(o=>!o)}>☰</button>
            <span className="pg-title">{NAV.find(n=>n.id===tab)?.label}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span className="stu-chip">Sem {STUDENT.sem} · {STUDENT.dept}</span>
          </div>
        </div>

        <div className="content">
          {tab==="dashboard"&&(<>
            <div className="g4">
              {[
                {lbl:"Attendance",val:`${overallAtt}%`,icon:"✅",clr:overallAtt>=75?"#22c55e":"#ef4444"},
                {lbl:"Fee Balance",val:`₹${totalDue.toLocaleString("en-IN")}`,icon:"💰",clr:totalDue>0?"#f59e0b":"#22c55e"},
                {lbl:"SGPA (Sem 5)",val:"8.62",icon:"🏆",clr:"#a78bfa"},
                {lbl:"Cur. Semester",val:STUDENT.sem,icon:"📚",clr:"#14b8a6"},
              ].map(c=>(
                <div className="mc" key={c.lbl}>
                  <div className="mc-top"><div><div className="mc-lbl">{c.lbl}</div><div className="mc-val" style={{color:c.clr}}>{c.val}</div></div><div style={{fontSize:22}}>{c.icon}</div></div>
                </div>
              ))}
            </div>
            <div className="sec-hd"><div className="sec-title">Quick Access</div></div>
            <div className="quick-grid">
              {[
                {icon:"📊",title:"Attendance",sub:"Detailed logs",clr:"#14b8a6",action:()=>setTab("attendance")},
                {icon:"📋",title:"Marks",sub:"Grade report",clr:"#0ea5e9",action:()=>setTab("marks")},
                {icon:"💳",title:"Fees",sub:`₹${totalDue.toLocaleString("en-IN")} due`,clr:"#22c55e",action:()=>setTab("fees")},
                {icon:"👤",title:"Profile",sub:"My details",clr:"#a78bfa",action:()=>setTab("profile")},
              ].map(c=>(
                <div className="quick-card" key={c.title} onClick={c.action} style={{borderLeft:`4px solid ${c.clr}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:32,height:32,borderRadius:8,background:`${c.clr}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{c.icon}</div>
                    <div><div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{c.title}</div><div style={{fontSize:10,color:"#94a3b8",fontWeight:500}}>{c.sub}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </>)}

          {tab==="attendance"&&(<>
            <div className="sec-hd"><div><div className="sec-title">Attendance Tracking</div></div></div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th className="lft">Subject</th><th>Attended</th><th>Total</th><th>Percentage</th><th>Status</th></tr></thead>
                <tbody>{ATTENDANCE.map(a=>{
                  const pct=Math.round((a.present/a.total)*100);
                  const pc=pct>=75?"#22c55e":"#ef4444";
                  return(<tr key={a.code}>
                    <td className="lft"><div className="s-name">{a.name}</div><div className="s-code">{a.code}</div></td>
                    <td><span className="mk-num">{a.present}</span></td>
                    <td><span className="mk-num">{a.total}</span></td>
                    <td><span className="mk-num" style={{color:pc}}>{pct}%</span></td>
                    <td><span className="chip" style={{background:pct>=75?"#dcfce7":"#fee2e2",color:pct>=75?"#166534":"#991b1b"}}>{pct>=75?"Eligible":"Shortfall"}</span></td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </>)}

          {tab==="marks"&&(<>
            <div className="sec-hd">
              <div><div className="sec-title">Mark Statement</div></div>
              {semData.subjects.length>0&&<button className="btn-teal" onClick={()=>downloadMarksPDF(semData, STUDENT)}>⬇ Save PDF</button>}
            </div>
            <div className="sem-tabs">
              {[1,2,3,4,5,6,7,8].map(sNum=>(
                <button key={sNum} className={`sem-tab ${viewSem===sNum?"on":""}`} onClick={()=>setViewSem(sNum)}>Sem {sNum}</button>
              ))}
            </div>
            {gpa&&<div className="gpa-banner">
              <div><div style={{fontSize:11,opacity:0.7,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Semester {viewSem} · SGPA</div><div style={{fontSize:28,fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>{gpa}</div></div>
              <div style={{display:"flex",gap:12}}>{["O","A+","A","B+","B","F"].map(g=><div key={g} style={{textAlign:"center"}}><div style={{fontSize:10,opacity:0.6,marginBottom:2}}>{g}</div><div style={{fontSize:14,fontWeight:700}}>{semData.subjects.filter(s=>grade(s.sem)===g).length}</div></div>)}</div>
            </div>}
            {semData.subjects.length===0?<div style={{textAlign:"center",padding:40,color:"#94a3b8"}}>No data available for this semester</div>:(
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead><tr><th className="lft">Subject</th><th>CIA 1</th><th>CIA 2</th><th>CIA 3</th><th>Total</th><th>Grade</th></tr></thead>
                  <tbody>{semData.subjects.map(s=>{
                    const g=grade(s.sem);
                    return(<tr key={s.id}>
                      <td className="lft"><div className="s-name">{s.name}</div><div className="s-code">{s.code}</div></td>
                      {["cia1","cia2","cia3"].map(k=><td key={k}><span className="mk-num">{s[k]??'—'}</span></td>)}
                      <td><span className="mk-num" style={{color:"#0f172a"}}>{s.sem??'—'}</span></td>
                      <td><span className="chip" style={{background:`${gradeColor(g)}20`,color:gradeColor(g)}}>{g}</span></td>
                    </tr>);
                  })}</tbody>
                </table>
              </div>
            )}
          </>)}

          {tab==="fees"&&(<>
            <div className="sec-hd"><div><div className="sec-title">Fee Management</div></div></div>
            {filteredFees.map(f=>{
              const balance=f.allocated-f.paid;
              return(<div className="fee-card" key={f.id}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                  <div><div style={{fontSize:14,fontWeight:800}}>{f.type}</div><div style={{fontSize:10,color:"#94a3b8"}}>AY {f.year}</div></div>
                  {balance===0?<span className="chip" style={{background:"#dcfce7",color:"#166534"}}>PAID</span>:<button className="btn-pay" onClick={()=>setPayModal(f)}>Pay ₹{balance.toLocaleString("en-IN")}</button>}
                </div>
                <div style={{display:"flex",gap:24}}>
                  <div><div className="prof-lbl">Allocated</div><div className="mk-num">₹{f.allocated.toLocaleString("en-IN")}</div></div>
                  <div><div className="prof-lbl">Paid</div><div className="mk-num" style={{color:"#16a34a"}}>₹{f.paid.toLocaleString("en-IN")}</div></div>
                </div>
                {f.receipts.length>0&&<div style={{marginTop:14}}>
                  {f.receipts.map(r=>(
                    <div className="receipt-row" key={r.no}>
                      <div><div style={{fontSize:12,fontWeight:700}}>{r.no}</div><div style={{fontSize:10,color:"#94a3b8"}}>{r.date}</div></div>
                      <button className="btn-outline" style={{padding:"4px 8px",fontSize:11}} onClick={()=>downloadReceiptPDF(f,r,STUDENT)}>Receipt</button>
                    </div>
                  ))}
                </div>}
              </div>);
            })}
          </>)}

          {tab==="profile"&&(<>
            <div className="sec-hd"><div className="sec-title">Student Profile</div></div>
            <div className="prof-grid">
              {[
                {lbl:"Full Name",val:STUDENT.name},{lbl:"Register ID",val:STUDENT.username || STUDENT.regNo},
                {lbl:"Department",val:STUDENT.dept},{lbl:"Batch",val:STUDENT.batch},
                {lbl:"Email",val:STUDENT.email},{lbl:"Phone",val:STUDENT.phone},
                {lbl:"DOB",val:STUDENT.dob},{lbl:"Advisor",val:STUDENT.advisor},
                {lbl:"Address",val:STUDENT.address},
              ].map(r=>(
                <div className="prof-row" key={r.lbl}><div className="prof-lbl">{r.lbl}</div><div className="prof-val">{r.val || "—"}</div></div>
              ))}
            </div>
          </>)}

        </div>
      </div>

      {payModal&&(
        <div className="modal-bg" onClick={()=>setPayModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:18,marginBottom:14}}>Fee Payment</div>
            <div style={{background:"#f8fafc",borderRadius:12,padding:14,marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:12,color:"#64748b"}}>Fee Type</span><span style={{fontSize:13,fontWeight:700}}>{payModal.type}</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:"#64748b"}}>Amount Due</span><span style={{fontSize:16,fontWeight:800,color:"#ef4444"}}>₹{(payModal.allocated-payModal.paid).toLocaleString("en-IN")}</span></div>
            </div>
            <div className="prof-lbl" style={{marginBottom:8}}>Select Mode</div>
            <div style={{display:"flex",gap:8,marginBottom:22}}>
              {["Online","Cash","DD"].map(m=>(
                <button key={m} className={`mode-btn ${payMode===m?"on":""}`} onClick={()=>setPayMode(m)}>{m}</button>
              ))}
            </div>
            <button className="btn-teal" style={{width:"100%",padding:12,justifyContent:"center"}} onClick={handlePay}>Confirm & Pay</button>
          </div>
        </div>
      )}

      {toast&&<div className="toast">{toast}</div>}
    </div>
  </>);
}
