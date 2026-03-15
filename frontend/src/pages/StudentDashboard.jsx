import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { loadStudentFees, saveStudentFees } from "../utils/feeStore";

// Per-student profile data
const STUDENTS_DATA = {
  "21CSE001": {
    name: "Arjun Selvan", regNo: "21CSE001",
    dept: "Computer Science & Engineering", batch: "2021–2025",
    sem: 6, phone: "+91 98765 43210", email: "arjun@student.edu",
    dob: "12 March 2003", advisor: "Dr. Ramesh Kumar",
  },
  "21CSE002": {
    name: "Priya Lakshmi", regNo: "21CSE002",
    dept: "Computer Science & Engineering", batch: "2021–2025",
    sem: 6, phone: "+91 98765 43211", email: "priya@student.edu",
    dob: "25 July 2003", advisor: "Dr. Ramesh Kumar",
  },
};
const DEFAULT_STUDENT = {
  name: "Student", regNo: "", dept: "CSE", batch: "2021–2025",
  sem: 6, phone: "", email: "", dob: "", advisor: "",
};

const ALL_SEMESTERS = [
  { sem:1, subjects:[
    { code:"CS101",name:"Engg Maths I",       cia1:42,cia2:38,cia3:44,sem:72,credits:4 },
    { code:"CS102",name:"Programming in C",    cia1:45,cia2:41,cia3:43,sem:81,credits:4 },
    { code:"CS103",name:"Engg Physics",        cia1:36,cia2:40,cia3:39,sem:65,credits:3 },
    { code:"CS104",name:"Engg Chemistry",      cia1:38,cia2:42,cia3:40,sem:70,credits:3 },
    { code:"CS105",name:"English",             cia1:44,cia2:46,cia3:45,sem:78,credits:2 },
  ]},
  { sem:2, subjects:[
    { code:"CS201",name:"Engg Maths II",       cia1:40,cia2:43,cia3:41,sem:74,credits:4 },
    { code:"CS202",name:"Data Structures",      cia1:46,cia2:48,cia3:47,sem:88,credits:4 },
    { code:"CS203",name:"Digital Electronics",  cia1:39,cia2:37,cia3:41,sem:66,credits:3 },
    { code:"CS204",name:"OOP using Java",       cia1:44,cia2:45,cia3:43,sem:82,credits:4 },
    { code:"CS205",name:"Environmental Science",cia1:41,cia2:43,cia3:42,sem:71,credits:2 },
  ]},
  { sem:3, subjects:[
    { code:"CS301",name:"Discrete Mathematics", cia1:43,cia2:41,cia3:44,sem:76,credits:4 },
    { code:"CS302",name:"Computer Organisation",cia1:38,cia2:40,cia3:39,sem:67,credits:3 },
    { code:"CS303",name:"DBMS",                 cia1:47,cia2:46,cia3:48,sem:90,credits:4 },
    { code:"CS304",name:"OS Concepts",          cia1:42,cia2:44,cia3:41,sem:79,credits:3 },
    { code:"CS305",name:"Python Programming",   cia1:45,cia2:47,cia3:46,sem:85,credits:3 },
  ]},
  { sem:4, subjects:[
    { code:"CS401",name:"Theory of Computation",cia1:39,cia2:37,cia3:40,sem:68,credits:3 },
    { code:"CS402",name:"Computer Networks",     cia1:44,cia2:46,cia3:45,sem:83,credits:4 },
    { code:"CS403",name:"Software Engineering",  cia1:43,cia2:42,cia3:44,sem:77,credits:3 },
    { code:"CS404",name:"Web Technologies",      cia1:46,cia2:48,cia3:47,sem:89,credits:3 },
    { code:"CS405",name:"Microprocessors",       cia1:37,cia2:39,cia3:38,sem:63,credits:3 },
  ]},
  { sem:5, subjects:[
    { code:"CS501",name:"Compiler Design",       cia1:41,cia2:43,cia3:42,sem:75,credits:3 },
    { code:"CS502",name:"Artificial Intelligence",cia1:45,cia2:47,cia3:46,sem:87,credits:4 },
    { code:"CS503",name:"Cloud Computing",       cia1:44,cia2:45,cia3:43,sem:80,credits:3 },
    { code:"CS504",name:"Machine Learning",      cia1:48,cia2:49,cia3:47,sem:92,credits:4 },
    { code:"CS505",name:"Cyber Security",        cia1:42,cia2:41,cia3:44,sem:74,credits:3 },
  ]},
  { sem:6, subjects:[
    { code:"CS601",name:"Data Structures",       cia1:44,cia2:46,cia3:45,sem:null,credits:3 },
    { code:"CS602",name:"DBMS",                  cia1:47,cia2:48,cia3:null,sem:null,credits:4 },
    { code:"CS603",name:"Operating Systems",     cia1:43,cia2:null,cia3:null,sem:null,credits:3 },
    { code:"CS604",name:"Computer Networks",     cia1:45,cia2:46,cia3:null,sem:null,credits:3 },
    { code:"CS605",name:"Software Engineering",  cia1:null,cia2:null,cia3:null,sem:null,credits:3 },
  ]},
  { sem:7, subjects:[] },
  { sem:8, subjects:[] },
];

const ATTENDANCE = [
  { code:"CS601",name:"Data Structures",    present:38,total:48 },
  { code:"CS602",name:"DBMS",               present:42,total:48 },
  { code:"CS603",name:"Operating Systems",  present:35,total:46 },
  { code:"CS604",name:"Computer Networks",  present:40,total:48 },
  { code:"CS605",name:"Software Engineering",present:44,total:48 },
];

// Fees are loaded from shared localStorage store (see feeStore.js)

function grade(v){ if(v===null)return"—"; if(v>=90)return"O"; if(v>=80)return"A+"; if(v>=70)return"A"; if(v>=60)return"B+"; if(v>=50)return"B"; return"F"; }
function gradeColor(g){ const m={"O":"#4ade80","A+":"#34d399","A":"#60a5fa","B+":"#a78bfa","B":"#fbbf24","F":"#f87171"}; return m[g]||"#94a3b8"; }
function bestTwo(a,b,c){ return[a,b,c].filter(v=>v!==null).sort((x,y)=>y-x).slice(0,2).reduce((s,v)=>s+v,0); }
function calcGPA(subs){ const v=subs.filter(s=>s.sem!==null); if(!v.length)return null; const pts=v.reduce((s,sub)=>{const g=grade(sub.sem);const p=g==="O"?10:g==="A+"?9:g==="A"?8:g==="B+"?7:g==="B"?6:0;return s+p*sub.credits;},0); const cr=v.reduce((s,sub)=>s+sub.credits,0); return cr?(pts/cr).toFixed(2):null; }

function downloadMarksPDF(semData){
  const rows=semData.subjects.map(s=>{const b2=bestTwo(s.cia1,s.cia2,s.cia3);const sc=Math.round((b2/100)*25);const tot=s.sem!==null?sc+s.sem:null;const g=grade(s.sem);return`<tr><td>${s.code}</td><td>${s.name}</td><td>${s.cia1??'—'}</td><td>${s.cia2??'—'}</td><td>${s.cia3??'—'}</td><td>${sc}</td><td>${s.sem??'—'}</td><td>${tot??'—'}</td><td style="font-weight:700;color:${gradeColor(g)}">${g}</td><td>${s.sem!==null?(s.sem>=50?'PASS':'FAIL'):'—'}</td></tr>`;}).join("");
  const gpa=calcGPA(semData.subjects);
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Mark Statement Sem ${semData.sem}</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#1e293b;font-size:13px}h2{text-align:center;color:#0f172a;margin-bottom:4px;font-size:18px}.meta{text-align:center;color:#64748b;margin-bottom:20px;font-size:12px}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:20px;font-size:12px}.info-row{display:flex;gap:6px}.info-lbl{color:#64748b;min-width:110px}.info-val{font-weight:600;color:#0f172a}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#0f172a;color:#fff;padding:8px;text-align:center}td{padding:7px 8px;border-bottom:1px solid #e2e8f0;text-align:center}tr:nth-child(even) td{background:#f8fafc}td:nth-child(2){text-align:left}.gpa{margin-top:16px;text-align:right;font-size:14px;font-weight:700;color:#0f172a}.footer{margin-top:30px;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:12px}@media print{body{padding:10px}}</style></head><body><h2>BHC ERP — Mark Statement</h2><div class="meta">Semester ${semData.sem} · ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}</div><div class="info-grid"><div class="info-row"><span class="info-lbl">Student Name</span><span class="info-val">Arjun Selvan</span></div><div class="info-row"><span class="info-lbl">Register No.</span><span class="info-val">21CSE001</span></div><div class="info-row"><span class="info-lbl">Department</span><span class="info-val">CSE</span></div><div class="info-row"><span class="info-lbl">Batch</span><span class="info-val">2021-2025</span></div></div><table><thead><tr><th>Code</th><th>Subject</th><th>CIA 1</th><th>CIA 2</th><th>CIA 3</th><th>CIA /25</th><th>Sem /100</th><th>Total</th><th>Grade</th><th>Result</th></tr></thead><tbody>${rows}</tbody></table>${gpa?`<div class="gpa">SGPA: ${gpa}</div>`:""}<div class="footer">Computer-generated statement · BHC ERP</div></body></html>`;
  const w=window.open("","_blank");w.document.write(html);w.document.close();w.print();
}

function downloadReceiptPDF(fee,receipt){
  const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt ${receipt.no}</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#1e293b;font-size:13px;max-width:600px;margin:auto}.header{text-align:center;margin-bottom:24px;border-bottom:2px solid #0f172a;padding-bottom:16px}h2{font-size:20px;color:#0f172a;margin:0}.sub{color:#64748b;font-size:12px;margin-top:4px}.receipt-no{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:10px 16px;font-size:14px;font-weight:700;color:#166534;margin:16px 0;text-align:center}table{width:100%;border-collapse:collapse;margin:20px 0}td{padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px}td:first-child{color:#64748b;width:40%}td:last-child{font-weight:600;color:#0f172a}.amount-row td{font-size:18px;font-weight:800;color:#15803d;border-bottom:none;padding-top:16px}.stamp{margin-top:30px;text-align:center;font-size:11px;color:#94a3b8}.paid-stamp{display:inline-block;border:3px solid #16a34a;border-radius:8px;padding:6px 20px;color:#16a34a;font-size:22px;font-weight:900;transform:rotate(-8deg);letter-spacing:4px;margin:16px auto}</style></head><body><div class="header"><h2>BHC ERP</h2><div class="sub">Fee Payment Receipt</div></div><div class="receipt-no">Receipt No: ${receipt.no}</div><table><tr><td>Student Name</td><td>Arjun Selvan</td></tr><tr><td>Register No.</td><td>21CSE001</td></tr><tr><td>Fee Type</td><td>${fee.type}</td></tr><tr><td>Academic Year</td><td>${fee.year}</td></tr><tr><td>Payment Date</td><td>${receipt.date}</td></tr><tr><td>Payment Mode</td><td>${receipt.mode}</td></tr><tr class="amount-row"><td>Amount Paid</td><td>₹${receipt.amount.toLocaleString("en-IN")}</td></tr></table><div style="text-align:center"><div class="paid-stamp">PAID</div></div><div class="stamp">Computer-generated receipt. No signature required.</div></body></html>`;
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
  const STUDENT = STUDENTS_DATA[user?.username] || { ...DEFAULT_STUDENT, name: user?.name || "Student", regNo: user?.username || "" };
  const [tab,setTab]=useState("dashboard");
  const [sidebar,setSidebar]=useState(true);
  const [viewSem,setViewSem]=useState(6);
  const [feeYear,setFeeYear]=useState("2024-25");
  const [payModal,setPayModal]=useState(null);
  const [payMode,setPayMode]=useState("Online");
  const [fees,setFees]=useState(()=>loadStudentFees(user?.username));
  const [toast,setToast]=useState("");

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

  const semData=ALL_SEMESTERS.find(s=>s.sem===viewSem)||{sem:viewSem,subjects:[]};
  const gpa=calcGPA(semData.subjects);
  const filteredFees=fees.filter(f=>f.year===feeYear);
  const totalAllocated=filteredFees.reduce((s,f)=>s+f.allocated,0);
  const totalPaid=filteredFees.reduce((s,f)=>s+f.paid,0);
  const totalDue=totalAllocated-totalPaid;
  const overallAtt=ATTENDANCE.length?Math.round(ATTENDANCE.reduce((s,a)=>s+(a.present/a.total)*100,0)/ATTENDANCE.length):0;

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
      .sb-role{font-size:10px;color:#94a3b8;font-weight:500}
      .sb-sec{font-size:9px;font-weight:700;color:#b0cac8;text-transform:uppercase;letter-spacing:1.5px;padding:14px 18px 6px;overflow:hidden;white-space:nowrap}
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
      .mc:hover{box-shadow:0 6px 20px rgba(20,184,166,.1);transform:translateY(-2px)}
      .mc-top{display:flex;justify-content:space-between;align-items:flex-start}
      .mc-lbl{font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:6px}
      .mc-val{font-size:26px;font-weight:800;font-family:'JetBrains Mono',monospace}
      .mc-sub{font-size:11px;color:#94a3b8;margin-top:4px}
      .sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
      .sec-title{font-size:16px;font-weight:800;color:#0f172a}
      .sec-sub{font-size:11px;color:#94a3b8;margin-top:2px;font-weight:500}
      .btn-teal{background:linear-gradient(135deg,#14b8a6,#0ea5e9);border:none;color:#fff;padding:9px 18px;border-radius:10px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .2s;box-shadow:0 3px 10px rgba(20,184,166,.25)}
      .btn-teal:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(20,184,166,.35)}
      .btn-outline{background:#fff;border:1.5px solid #e2e8f0;color:#64748b;padding:7px 14px;border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:6px}
      .btn-outline:hover{border-color:#14b8a6;color:#0d9488;background:#f0fdfc}
      .btn-pay{background:linear-gradient(135deg,#22c55e,#16a34a);border:none;color:#fff;padding:8px 16px;border-radius:9px;font-size:13px;font-weight:700;cursor:pointer;transition:all .2s}
      .btn-pay:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(34,197,94,.3)}
      .sem-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:20px}
      .sem-tab{padding:6px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;border:1.5px solid #e2e8f0;background:#fff;color:#94a3b8;transition:all .2s}
      .sem-tab:hover{border-color:#14b8a6;color:#0d9488}
      .sem-tab.on{background:linear-gradient(135deg,#14b8a6,#0ea5e9);border-color:transparent;color:#fff}
      .sem-tab.empty{opacity:.4;cursor:default}
      .tbl-wrap{background:#fff;border:1px solid #e8f4f3;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.04)}
      .tbl{width:100%;border-collapse:collapse}
      .tbl th{padding:11px 14px;text-align:center;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;background:#f8fffe;border-bottom:1px solid #e8f4f3}
      .tbl th.lft{text-align:left}
      .tbl td{padding:11px 14px;border-bottom:1px solid #f0fafa;text-align:center;font-size:13px;color:#0f172a}
      .tbl td.lft{text-align:left}
      .tbl tr:last-child td{border-bottom:none}
      .tbl tr:hover td{background:#f0fdfc}
      .s-name{font-size:13px;font-weight:700;color:#0f172a}
      .s-code{font-size:11px;color:#94a3b8;font-family:'JetBrains Mono',monospace;margin-top:1px}
      .chip{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;padding:3px 10px;border-radius:6px}
      .mk-num{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600}
      .fee-card{background:#fff;border:1px solid #e8f4f3;border-radius:14px;padding:18px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,.03);transition:all .2s}
      .fee-card:hover{border-color:rgba(20,184,166,.25);box-shadow:0 4px 14px rgba(20,184,166,.08)}
      .receipt-row{display:flex;align-items:center;justify-content:space-between;background:#f8fffe;border:1px solid #e8f4f3;border-radius:8px;padding:8px 12px;margin-top:6px}
      .prof-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:16px}
      .prof-row{background:#f8fffe;border-radius:8px;padding:10px 14px}
      .prof-lbl{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;font-weight:600;margin-bottom:3px}
      .prof-val{font-size:14px;font-weight:700;color:#0f172a}
      .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.35);backdrop-filter:blur(6px);z-index:1000;display:flex;align-items:center;justify-content:center}
      .modal{background:#fff;border-radius:20px;padding:28px;width:420px;max-width:92vw;box-shadow:0 24px 60px rgba(0,0,0,.15)}
      .mode-btn{flex:1;padding:9px;border-radius:9px;border:1.5px solid #e2e8f0;background:#fff;font-size:13px;font-weight:600;cursor:pointer;color:#64748b;transition:all .2s}
      .mode-btn.on{border-color:#14b8a6;background:#f0fdfc;color:#0d9488}
      .toast{position:fixed;bottom:28px;right:28px;background:linear-gradient(135deg,#14b8a6,#0ea5e9);color:#fff;padding:12px 22px;border-radius:12px;font-weight:700;font-size:14px;box-shadow:0 8px 24px rgba(20,184,166,.35);z-index:999;animation:fu .3s ease}
      .gpa-banner{background:linear-gradient(135deg,#0f172a,#1e3a5f);border-radius:14px;padding:18px 22px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between}
      .quick-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:20px}
      .quick-card{background:#fff;border:1px solid #e8f4f3;border-radius:14px;padding:16px;cursor:pointer;transition:all .2s;box-shadow:0 1px 4px rgba(0,0,0,.03)}
      .quick-card:hover{border-color:#14b8a6;box-shadow:0 6px 18px rgba(20,184,166,.12);transform:translateY(-2px)}
      @keyframes fu{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      @media(max-width:900px){.g4{grid-template-columns:repeat(2,1fr)}.prof-grid{grid-template-columns:1fr}.quick-grid{grid-template-columns:1fr}.sb{display:none}}
    `}</style>

    <div className="sr">
      {/* SIDEBAR */}
      <aside className={`sb ${sidebar?"":"cl"}`}>
        <div className="sb-brand">
          <div className="sb-logo">🎓</div>
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
          <div style={{display:"flex",alignItems:"center",gap:10,overflow:"hidden"}}>
            <div className="stu-av">🧑‍💻</div>
            {sidebar&&<div><div style={{fontSize:12,fontWeight:700,color:"#0f172a",whiteSpace:"nowrap"}}>{user?.name || "Student"}</div><div style={{fontSize:10,color:"#94a3b8",fontFamily:"'JetBrains Mono',monospace"}}>{user?.username}</div></div>}
          </div>
          {sidebar&&(
            <button onClick={handleLogout} style={{
              marginTop:12, width:"100%", background:"rgba(239,68,68,0.08)",
              border:"1.5px solid rgba(239,68,68,0.2)", color:"#ef4444",
              padding:"8px 0", borderRadius:9, cursor:"pointer",
              fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:700,
              transition:"all 0.2s",
            }}>🚪 Logout</button>
          )}
        </div>
      </aside>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <button className="menu-btn" onClick={()=>setSidebar(o=>!o)}>☰</button>
            <span className="pg-title">{NAV.find(n=>n.id===tab)?.label}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span className="stu-chip">Sem {STUDENT.sem} · CSE</span>
            <span style={{fontSize:12,color:"#94a3b8",fontWeight:600}}>{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</span>
          </div>
        </div>

        <div className="content">

          {/* DASHBOARD */}
          {tab==="dashboard"&&(<>
            <div className="g4">
              {[
                {lbl:"Current Semester",val:`Sem ${STUDENT.sem}`,icon:"📚",clr:"#14b8a6",sub:STUDENT.batch},
                {lbl:"Attendance",val:`${overallAtt}%`,icon:"✅",clr:overallAtt>=75?"#22c55e":"#ef4444",sub:overallAtt>=75?"Eligible":"Short"},
                {lbl:"Fee Balance",val:`₹${totalDue.toLocaleString("en-IN")}`,icon:"💰",clr:totalDue>0?"#f59e0b":"#22c55e",sub:"2024-25"},
                {lbl:"SGPA (Sem 5)",val:"8.62",icon:"🏆",clr:"#a78bfa",sub:"Last semester"},
              ].map(c=>(
                <div className="mc" key={c.lbl}>
                  <div className="mc-top"><div><div className="mc-lbl">{c.lbl}</div><div className="mc-val" style={{color:c.clr}}>{c.val}</div></div><div style={{fontSize:24}}>{c.icon}</div></div>
                  <div className="mc-sub">{c.sub}</div>
                </div>
              ))}
            </div>
            <div className="sec-hd"><div className="sec-title">Quick Access</div></div>
            <div className="quick-grid">
              {[
                {icon:"📊",title:"View Attendance",sub:"Hour-based details",clr:"#14b8a6",action:()=>setTab("attendance")},
                {icon:"📋",title:"Mark Statement",sub:"All 8 semesters",clr:"#0ea5e9",action:()=>setTab("marks")},
                {icon:"💳",title:"Pay Fees",sub:`₹${totalDue.toLocaleString("en-IN")} due`,clr:"#22c55e",action:()=>setTab("fees")},
                {icon:"👤",title:"My Profile",sub:"Personal details",clr:"#a78bfa",action:()=>setTab("profile")},
              ].map(c=>(
                <div className="quick-card" key={c.title} onClick={c.action} style={{borderLeft:`4px solid ${c.clr}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:40,height:40,borderRadius:10,background:`${c.clr}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{c.icon}</div>
                    <div><div style={{fontWeight:800,fontSize:14,color:"#0f172a"}}>{c.title}</div><div style={{fontSize:11,color:"#94a3b8",fontWeight:500,marginTop:2}}>{c.sub}</div></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="sec-hd" style={{marginTop:22}}>
              <div><div className="sec-title">Current Semester Subjects</div><div className="sec-sub">Semester 6 · CIA in progress</div></div>
              <button className="btn-teal" onClick={()=>setTab("marks")}>View All →</button>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th className="lft">Subject</th><th>CIA 1</th><th>CIA 2</th><th>CIA 3</th><th>Attendance</th><th>Status</th></tr></thead>
                <tbody>{ALL_SEMESTERS.find(s=>s.sem===6)?.subjects.map(s=>{
                  const att=ATTENDANCE.find(a=>a.code===s.code);
                  const pct=att?Math.round((att.present/att.total)*100):0;
                  const pc=pct>=75?"#22c55e":pct>=50?"#f59e0b":"#ef4444";
                  return(<tr key={s.code}>
                    <td className="lft"><div className="s-name">{s.name}</div><div className="s-code">{s.code}</div></td>
                    {[s.cia1,s.cia2,s.cia3].map((v,i)=><td key={i}><span className="mk-num" style={{color:v!==null?(v>=25?"#22c55e":"#ef4444"):"#94a3b8"}}>{v!==null?v:"—"}</span></td>)}
                    <td><div style={{fontWeight:700,fontSize:12,color:pc,fontFamily:"'JetBrains Mono',monospace"}}>{pct}%</div><div style={{width:50,height:4,background:"#e8f4f3",borderRadius:3,marginTop:3}}><div style={{width:`${pct}%`,height:"100%",background:pc,borderRadius:3}}/></div></td>
                    <td><span className="chip" style={{background:pct>=75?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)",color:pct>=75?"#16a34a":"#dc2626",border:`1px solid ${pct>=75?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)"}`}}>{pct>=75?"On Track":"At Risk"}</span></td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </>)}

          {/* ATTENDANCE */}
          {tab==="attendance"&&(<>
            <div className="sec-hd"><div><div className="sec-title">Attendance Details</div><div className="sec-sub">Hour-based · Semester 6</div></div></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
              {[
                {lbl:"Overall Attendance",val:`${overallAtt}%`,clr:overallAtt>=75?"#22c55e":"#ef4444"},
                {lbl:"Total Classes",val:ATTENDANCE.reduce((s,a)=>s+a.total,0),clr:"#0ea5e9"},
                {lbl:"Classes Attended",val:ATTENDANCE.reduce((s,a)=>s+a.present,0),clr:"#a78bfa"},
              ].map(c=><div className="mc" key={c.lbl}><div className="mc-lbl">{c.lbl}</div><div className="mc-val" style={{color:c.clr}}>{c.val}</div></div>)}
            </div>
            {overallAtt<75&&<div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:12,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#b91c1c",display:"flex",gap:8,alignItems:"center"}}>⚠️ Attendance below 75%. You may be barred from semester exams. Please attend all remaining classes.</div>}
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th className="lft">Subject</th><th>Attended</th><th>Total</th><th>Percentage</th><th>Status</th></tr></thead>
                <tbody>{ATTENDANCE.map(a=>{
                  const pct=Math.round((a.present/a.total)*100);
                  const pc=pct>=75?"#22c55e":pct>=50?"#f59e0b":"#ef4444";
                  const needed=Math.max(0,Math.ceil((0.75*a.total-a.present)/(1-0.75)));
                  return(<tr key={a.code}>
                    <td className="lft"><div className="s-name">{a.name}</div><div className="s-code">{a.code}</div></td>
                    <td><span className="mk-num" style={{color:"#22c55e"}}>{a.present}</span></td>
                    <td><span className="mk-num">{a.total}</span></td>
                    <td><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:60,height:6,background:"#e8f4f3",borderRadius:3}}><div style={{width:`${pct}%`,height:"100%",background:pc,borderRadius:3}}/></div><span className="mk-num" style={{color:pc,fontSize:13}}>{pct}%</span></div></td>
                    <td>{pct>=75?<span className="chip" style={{background:"rgba(34,197,94,.1)",color:"#16a34a",border:"1px solid rgba(34,197,94,.3)"}}>Eligible ✓</span>:<div><span className="chip" style={{background:"rgba(239,68,68,.1)",color:"#dc2626",border:"1px solid rgba(239,68,68,.3)"}}>Short</span><div style={{fontSize:10,color:"#94a3b8",marginTop:3}}>Need {needed} more</div></div>}</td>
                  </tr>);
                })}</tbody>
              </table>
            </div>
          </>)}

          {/* MARKS */}
          {tab==="marks"&&(<>
            <div className="sec-hd">
              <div><div className="sec-title">Mark Statement</div><div className="sec-sub">All 8 Semesters · CIA + Semester Marks</div></div>
              {semData.subjects.length>0&&<button className="btn-teal" onClick={()=>downloadMarksPDF(semData)}>⬇ Download PDF</button>}
            </div>
            <div className="sem-tabs">
              {ALL_SEMESTERS.map(s=>(
                <button key={s.sem} className={`sem-tab ${viewSem===s.sem?"on":""} ${s.subjects.length===0?"empty":""}`} onClick={()=>s.subjects.length>0&&setViewSem(s.sem)}>
                  Sem {s.sem}{s.subjects.length===0&&<span style={{fontSize:9,marginLeft:3}}>–</span>}
                </button>
              ))}
            </div>
            {gpa&&<div className="gpa-banner">
              <div><div style={{fontSize:11,color:"rgba(255,255,255,.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Semester {viewSem} · SGPA</div><div style={{fontSize:30,fontWeight:800,color:"#14b8a6",fontFamily:"'JetBrains Mono',monospace"}}>{gpa}</div></div>
              <div style={{display:"flex",gap:16}}>{["O","A+","A","B+","B","F"].map(g=><div key={g} style={{textAlign:"center"}}><div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginBottom:2}}>{g}</div><div style={{fontSize:13,fontWeight:700,color:gradeColor(g)}}>{semData.subjects.filter(s=>grade(s.sem)===g).length}</div></div>)}</div>
            </div>}
            {semData.subjects.length===0?<div style={{textAlign:"center",padding:"60px 20px",color:"#94a3b8"}}><div style={{fontSize:40,marginBottom:12}}>📋</div><div style={{fontWeight:700,fontSize:16,color:"#64748b"}}>No data yet</div><div style={{fontSize:13,marginTop:4}}>Semester {viewSem} is not yet completed</div></div>:(
              <div className="tbl-wrap" style={{overflowX:"auto"}}>
                <table className="tbl" style={{minWidth:750}}>
                  <thead><tr><th className="lft">Subject</th><th>CIA 1<span style={{opacity:.5,fontWeight:400}}>/50</span></th><th>CIA 2<span style={{opacity:.5,fontWeight:400}}>/50</span></th><th>CIA 3<span style={{opacity:.5,fontWeight:400}}>/50</span></th><th>CIA<span style={{opacity:.5,fontWeight:400}}>/25</span></th><th>Sem<span style={{opacity:.5,fontWeight:400}}>/100</span></th><th>Total</th><th>Grade</th><th>Result</th></tr></thead>
                  <tbody>{semData.subjects.map(s=>{
                    const b2=bestTwo(s.cia1,s.cia2,s.cia3);const sc=Math.round((b2/100)*25);const tot=s.sem!==null?sc+s.sem:null;const g=grade(s.sem);const pass=s.sem!==null&&s.sem>=50;
                    return(<tr key={s.code}>
                      <td className="lft"><div className="s-name">{s.name}</div><div className="s-code">{s.code} · {s.credits}cr</div></td>
                      {[s.cia1,s.cia2,s.cia3].map((v,i)=><td key={i}><span className="mk-num" style={{color:v!==null?(v>=25?"#16a34a":"#dc2626"):"#94a3b8"}}>{v!==null?v:"—"}</span></td>)}
                      <td><span className="mk-num" style={{color:"#f59e0b"}}>{sc}</span></td>
                      <td><span className="mk-num" style={{color:s.sem!==null?(s.sem>=50?"#22c55e":"#ef4444"):"#94a3b8"}}>{s.sem!==null?s.sem:"—"}</span></td>
                      <td><span className="mk-num" style={{color:"#0f172a",fontWeight:700}}>{tot!==null?tot:"—"}</span></td>
                      <td><span className="chip" style={{background:`${gradeColor(g)}18`,color:gradeColor(g),border:`1px solid ${gradeColor(g)}44`,fontSize:13}}>{g}</span></td>
                      <td>{s.sem!==null?<span className="chip" style={{background:pass?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)",color:pass?"#16a34a":"#dc2626",border:`1px solid ${pass?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)"}`}}>{pass?"PASS":"FAIL"}</span>:<span style={{fontSize:12,color:"#94a3b8"}}>Pending</span>}</td>
                    </tr>);
                  })}</tbody>
                </table>
              </div>
            )}
          </>)}

          {/* FEES */}
          {tab==="fees"&&(<>
            <div className="sec-hd">
              <div><div className="sec-title">Fee Payment</div><div className="sec-sub">View, pay, and download receipts</div></div>
              <select value={feeYear} onChange={e=>setFeeYear(e.target.value)} style={{background:"#fff",border:"1.5px solid #e2e8f0",borderRadius:9,padding:"7px 14px",fontSize:13,fontWeight:600,color:"#0f172a",outline:"none",cursor:"pointer"}}>
                <option value="2024-25">2024–25</option><option value="2023-24">2023–24</option>
              </select>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,marginBottom:22}}>
              {[{lbl:"Total Allocated",val:`₹${totalAllocated.toLocaleString("en-IN")}`,clr:"#0ea5e9"},{lbl:"Total Paid",val:`₹${totalPaid.toLocaleString("en-IN")}`,clr:"#22c55e"},{lbl:"Balance Due",val:`₹${totalDue.toLocaleString("en-IN")}`,clr:totalDue>0?"#ef4444":"#22c55e"}].map(c=>(
                <div className="mc" key={c.lbl}><div className="mc-lbl">{c.lbl}</div><div className="mc-val" style={{color:c.clr}}>{c.val}</div></div>
              ))}
            </div>
            {filteredFees.map(f=>{
              const balance=f.allocated-f.paid;const pct=Math.round((f.paid/f.allocated)*100);const pc=pct===100?"#22c55e":pct>50?"#f59e0b":"#ef4444";
              return(<div className="fee-card" key={f.id}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                  <div><div style={{fontSize:15,fontWeight:800,color:"#0f172a"}}>{f.type}</div><div style={{fontSize:11,color:"#94a3b8",fontWeight:500,marginTop:2}}>AY {f.year}</div></div>
                  <span className="chip" style={{background:balance===0?"rgba(34,197,94,.1)":"rgba(239,68,68,.1)",color:balance===0?"#16a34a":"#dc2626",border:`1px solid ${balance===0?"rgba(34,197,94,.3)":"rgba(239,68,68,.3)"}`}}>{balance===0?"PAID":"PENDING"}</span>
                </div>
                <div style={{display:"flex",gap:20,marginBottom:10}}>
                  <div><div style={{fontSize:10,color:"#94a3b8",fontWeight:600,marginBottom:2}}>ALLOCATED</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:700,color:"#0f172a"}}>₹{f.allocated.toLocaleString("en-IN")}</div></div>
                  <div><div style={{fontSize:10,color:"#94a3b8",fontWeight:600,marginBottom:2}}>PAID</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:700,color:"#22c55e"}}>₹{f.paid.toLocaleString("en-IN")}</div></div>
                  {balance>0&&<div><div style={{fontSize:10,color:"#94a3b8",fontWeight:600,marginBottom:2}}>DUE</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:15,fontWeight:700,color:"#ef4444"}}>₹{balance.toLocaleString("en-IN")}</div></div>}
                </div>
                <div style={{height:6,background:"#e8f4f3",borderRadius:3,overflow:"hidden",marginBottom:10}}>
                  <div style={{width:`${pct}%`,height:"100%",background:pc,borderRadius:3,transition:"width .5s ease"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:12,color:"#94a3b8",fontWeight:500}}>{pct}% paid</span>
                  {balance>0&&<button className="btn-pay" onClick={()=>setPayModal(f)}>Pay ₹{balance.toLocaleString("en-IN")} →</button>}
                </div>
                {f.receipts.length>0&&<div style={{marginTop:12}}>
                  <div style={{fontSize:11,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Receipts</div>
                  {f.receipts.map(r=>(
                    <div className="receipt-row" key={r.no}>
                      <div><div style={{fontSize:12,fontWeight:700,color:"#0f172a",fontFamily:"'JetBrains Mono',monospace"}}>{r.no}</div><div style={{fontSize:11,color:"#94a3b8"}}>{r.date} · {r.mode}</div></div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,color:"#22c55e",fontSize:14}}>₹{r.amount.toLocaleString("en-IN")}</span>
                        <button className="btn-outline" style={{padding:"5px 12px",fontSize:11}} onClick={()=>downloadReceiptPDF(f,r)}>⬇ Receipt</button>
                      </div>
                    </div>
                  ))}
                </div>}
              </div>);
            })}
          </>)}

          {/* PROFILE */}
          {tab==="profile"&&(<>
            <div className="sec-hd"><div className="sec-title">My Profile</div></div>
            <div style={{background:"#fff",border:"1px solid #e8f4f3",borderRadius:16,padding:24,boxShadow:"0 2px 8px rgba(0,0,0,.04)"}}>
              <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#14b8a6,#0ea5e9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,marginBottom:12}}>🧑‍💻</div>
              <div style={{fontWeight:800,fontSize:20,color:"#0f172a"}}>{STUDENT.name}</div>
              <div style={{fontSize:13,color:"#94a3b8",fontWeight:500,marginTop:2}}>{STUDENT.dept}</div>
              <div className="prof-grid">
                {[
                  {lbl:"Register No.",val:STUDENT.regNo},{lbl:"Batch",val:STUDENT.batch},
                  {lbl:"Current Semester",val:`Semester ${STUDENT.sem}`},{lbl:"Date of Birth",val:STUDENT.dob},
                  {lbl:"Email",val:STUDENT.email},{lbl:"Phone",val:STUDENT.phone},
                  {lbl:"Faculty Advisor",val:STUDENT.advisor},{lbl:"Department",val:"CSE"},
                ].map(r=>(
                  <div className="prof-row" key={r.lbl}><div className="prof-lbl">{r.lbl}</div><div className="prof-val">{r.val}</div></div>
                ))}
              </div>
            </div>
          </>)}

        </div>
      </div>

      {/* PAY MODAL */}
      {payModal&&(
        <div className="modal-bg" onClick={()=>setPayModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:17,fontWeight:800,color:"#0f172a",marginBottom:4}}>Pay {payModal.type}</div>
            <div style={{fontSize:13,color:"#64748b",marginBottom:20}}>Complete your payment</div>
            {[["Student",STUDENT.name],["Register No.",STUDENT.regNo],["Fee Type",payModal.type],["Academic Year",payModal.year]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #f1f5f9",fontSize:13}}>
                <span style={{color:"#64748b",fontWeight:500}}>{l}</span><span style={{fontWeight:700,color:"#0f172a"}}>{v}</span>
              </div>
            ))}
            <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"12px 16px",textAlign:"center",margin:"14px 0",fontSize:18,fontWeight:800,color:"#15803d"}}>
              Amount: ₹{(payModal.allocated-payModal.paid).toLocaleString("en-IN")}
            </div>
            <div style={{fontSize:12,color:"#94a3b8",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Payment Mode</div>
            <div style={{display:"flex",gap:8,marginBottom:16}}>
              {["Online","Cash","Cheque","DD"].map(m=>(
                <button key={m} className={`mode-btn ${payMode===m?"on":""}`} onClick={()=>setPayMode(m)}>{m}</button>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button style={{flex:1,padding:11,borderRadius:10,border:"1.5px solid #e2e8f0",background:"#fff",color:"#64748b",fontSize:14,fontWeight:600,cursor:"pointer"}} onClick={()=>setPayModal(null)}>Cancel</button>
              <button style={{flex:2,padding:11,borderRadius:10,border:"none",background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}} onClick={handlePay}>Confirm Payment ✓</button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div className="toast">{toast}</div>}
    </div>
  </>);
}
