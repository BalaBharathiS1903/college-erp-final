import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import appLogo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { loadAllFees, loadStudentFees, saveStudentFees } from "../utils/feeStore";

import { loadAllUsers, saveAllUsers } from "../utils/userStore";

// Student names for fee display
const studentNames = {
  "21CSE001": { name: "Arjun Selvan", dept: "CSE" },
  "21CSE002": { name: "Priya Lakshmi", dept: "CSE" },
};

// Build grouped fee rows by student from shared store
function buildAdminFees() {
  const allFees = loadAllFees();
  const students = [];
  let id = 1;
  for (const [regNo, studentFees] of Object.entries(allFees)) {
    const info = studentNames[regNo] || { name: regNo, dept: "" };
    
    // Filter to current year
    const currentFees = studentFees.filter(f => f.year === "2024-25");
    if (currentFees.length === 0) continue;

    // Calculate totals for the student
    const stAllocated = currentFees.reduce((sum, f) => sum + f.allocated, 0);
    const stPaid = currentFees.reduce((sum, f) => sum + f.paid, 0);

    students.push({
      id: id++,
      student: info.name,
      regNo,
      dept: info.dept,
      allocated: stAllocated,
      paid: stPaid,
      balance: stAllocated - stPaid,
      pct: stAllocated > 0 ? Math.round((stPaid / stAllocated) * 100) : 0,
      details: currentFees // The nested fees
    });
  }
  return students;
}

const subjects = ["Data Structures", "DBMS", "OS", "CN", "SE", "Maths III"];
const days = ["MON", "TUE", "WED", "THU", "FRI"];
const periods = ["9:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-1:00", "2:00-3:00", "3:00-4:00"];

const timetableData = {
  MON: ["Data Structures", "DBMS", "OS", "", "CN", "SE"],
  TUE: ["OS", "CN", "Data Structures", "", "Maths III", "DBMS"],
  WED: ["Maths III", "SE", "", "CN", "Data Structures", ""],
  THU: ["CN", "Data Structures", "DBMS", "", "SE", "OS"],
  FRI: ["DBMS", "Maths III", "SE", "", "OS", "CN"],
};

const subjectColors = {
  "Data Structures": "#e84545",
  "DBMS":            "#f5a623",
  "OS":              "#4a90e2",
  "CN":              "#7ed321",
  "SE":              "#bd10e0",
  "Maths III":       "#50e3c2",
  "":                "transparent",
};

// We calculate stats dynamically inside the component instead of here

// ─── Reusable Components ─────────────────────────────────────
function Badge({ role }) {
  const colors = { ADMIN: "#e84545", STAFF: "#f5a623", STUDENT: "#4a90e2" };
  return (
    <span style={{
      background: `${colors[role]}22`, color: colors[role],
      border: `1px solid ${colors[role]}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700,
      letterSpacing: 0.5, textTransform: "uppercase",
    }}>{role}</span>
  );
}

function StatusDot({ active }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: active ? "#7ed321" : "#666",
        boxShadow: active ? "0 0 6px #7ed321" : "none",
      }} />
      <span style={{ fontSize: 12, color: active ? "#7ed321" : "#666" }}>
        {active ? "Active" : "Inactive"}
      </span>
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(8px)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#14141f", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20, padding: 32, width: 520, maxWidth: "95vw",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>{title}</span>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#888", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormInput({ label, type = "text", value, onChange, placeholder, options }) {
  const inputStyle = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
    padding: "11px 14px", color: "#fff", fontSize: 14,
    fontFamily: "'DM Sans', sans-serif", outline: "none",
    boxSizing: "border-box",
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</label>
      {type === "select" ? (
        <select value={value} onChange={onChange} style={{ ...inputStyle, appearance: "none" }}>
          {options.map(o => <option key={o} value={o} style={{ background: "#14141f" }}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle} />
      )}
    </div>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────
export default function AdminDashboard() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState(loadAllUsers);
  const [fees, setFees] = useState(buildAdminFees);
  const [expandedStudents, setExpandedStudents] = useState({});

  const refreshFees = () => setFees(buildAdminFees());
  const [timetable, setTimetable] = useState(timetableData);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddFee, setShowAddFee] = useState(false);
  const [editTimetableCell, setEditTimetableCell] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", username: "", email: "", role: "STUDENT", dept: "CSE", password: "" });
  const [newFee, setNewFee] = useState({ student: "", regNo: "", dept: "CSE", feeType: "Tuition", allocated: "", year: "2024-25" });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { id: "dashboard",    label: "Dashboard",       icon: "⬛" },
    { id: "users",        label: "User Management", icon: "👥" },
    { id: "fees",         label: "Fees Management", icon: "💰" },
    { id: "timetable",    label: "Timetable",       icon: "📅" },
    { id: "staff-alloc",  label: "Staff Allocation",icon: "👨‍🏫" },
  ];

  const filteredUsers = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.username.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleAddUser = () => {
    const updatedUsers = [...users, { id: Date.now(), ...newUser, status: true }];
    setUsers(updatedUsers);
    saveAllUsers(updatedUsers);
    setNewUser({ name: "", username: "", email: "", role: "STUDENT", dept: "CSE", password: "" });
    setShowAddUser(false);
  };

  const handleAddFee = () => {
    const stFees = loadStudentFees(newFee.regNo);
    const newFeeRecord = { 
      id: Date.now(), 
      type: newFee.feeType + (newFee.feeType.endsWith("Fee") ? "" : " Fee"),
      allocated: Number(newFee.allocated), 
      paid: 0, 
      year: newFee.year, 
      receipts: [] 
    };
    stFees.push(newFeeRecord);
    saveStudentFees(newFee.regNo, stFees);
    refreshFees();
    setNewFee({ student: "", regNo: "", dept: "CSE", feeType: "Tuition", allocated: "", year: "2024-25" });
    setShowAddFee(false);
  };

  const handleTimetableChange = (day, periodIdx, subject) => {
    setTimetable(prev => ({ ...prev, [day]: prev[day].map((s, i) => i === periodIdx ? subject : s) }));
    setEditTimetableCell(null);
  };

  const toggleUserStatus = (id) => {
    const updatedUsers = users.map(u => u.id === id ? { ...u, status: !u.status } : u);
    setUsers(updatedUsers);
    saveAllUsers(updatedUsers);
  };

  const deleteUser = (id) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    saveAllUsers(updatedUsers);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

        .admin-root {
          display: flex; min-height: 100vh;
          background: #0c0c14;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
        }

        /* ── Sidebar ── */
        .sidebar {
          width: 240px; min-height: 100vh;
          background: #0f0f1a;
          border-right: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-direction: column;
          padding: 24px 0;
          transition: width 0.3s ease;
          position: relative; z-index: 10;
          flex-shrink: 0;
        }
        .sidebar.collapsed { width: 64px; }

        .sidebar-brand {
          display: flex; align-items: center; gap: 12px;
          padding: 0 20px 28px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 16px;
          overflow: hidden;
        }
        .brand-icon {
          width: 36px; height: 36px; flex-shrink: 0;
          background: linear-gradient(135deg, #e84545, #f5a623);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center; font-size: 18px;
        }
        .brand-text { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 800; white-space: nowrap; }

        .nav-section-label {
          padding: 0 20px;
          font-size: 10px; font-weight: 600;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase; letter-spacing: 1.5px;
          margin: 8px 0 6px;
          white-space: nowrap; overflow: hidden;
        }

        .nav-item {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 20px; margin: 1px 10px;
          border-radius: 10px; cursor: pointer;
          transition: all 0.2s;
          overflow: hidden; white-space: nowrap;
          border: none; background: none; color: rgba(255,255,255,0.45);
          font-family: 'DM Sans', sans-serif; font-size: 14px; width: calc(100% - 20px);
          text-align: left;
        }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .nav-item.active {
          background: rgba(232,69,69,0.12);
          color: #e84545;
          border: 1px solid rgba(232,69,69,0.2);
        }
        .nav-icon { font-size: 16px; flex-shrink: 0; }
        .nav-label { font-weight: 500; }

        .sidebar-footer {
          margin-top: auto; padding: 16px 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
        }
        .admin-tag {
          display: flex; align-items: center; gap: 10px;
        }
        .admin-avatar {
          width: 32px; height: 32px; border-radius: 8px;
          background: linear-gradient(135deg, #e84545, #f5a623);
          display: flex; align-items: center; justify-content: center; font-size: 14px;
          flex-shrink: 0;
        }
        .admin-info { overflow: hidden; }
        .admin-name { font-size: 13px; font-weight: 600; white-space: nowrap; }
        .admin-role { font-size: 11px; color: rgba(255,255,255,0.35); }

        /* ── Main Content ── */
        .main {
          flex: 1; display: flex; flex-direction: column; overflow: hidden;
        }

        .topbar {
          height: 60px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px;
          background: rgba(255,255,255,0.01);
          flex-shrink: 0;
        }
        .topbar-left { display: flex; align-items: center; gap: 14px; }
        .menu-btn {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.06);
          color: #888; width: 34px; height: 34px; border-radius: 8px;
          cursor: pointer; font-size: 14px;
        }
        .page-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; }

        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .topbar-badge {
          background: rgba(232,69,69,0.15);
          border: 1px solid rgba(232,69,69,0.3);
          color: #e84545; padding: "4px 12px"; border-radius: 20px; font-size: 12px; font-weight: 600;
          padding: 4px 12px;
        }

        .content-area { flex: 1; overflow-y: auto; padding: 28px; }

        /* ── Stats Cards ── */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; padding: 20px;
          transition: transform 0.2s, border-color 0.2s;
        }
        .stat-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.12); }
        .stat-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
        .stat-icon { font-size: 22px; }
        .stat-val { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 6px; }
        .stat-change { font-size: 11px; color: rgba(255,255,255,0.3); }

        /* ── Section Header ── */
        .section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 18px;
        }
        .section-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; }

        /* ── Buttons ── */
        .btn-primary {
          background: linear-gradient(135deg, #e84545, #f5a623);
          border: none; color: #fff;
          padding: 10px 20px; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 6px;
          transition: all 0.2s;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,69,69,0.3); }

        .btn-ghost {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          padding: 8px 14px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.08); color: #fff; }

        .btn-danger {
          background: rgba(232,69,69,0.12); border: 1px solid rgba(232,69,69,0.2);
          color: #e84545; padding: 6px 12px; border-radius: 8px;
          font-size: 12px; cursor: pointer; transition: all 0.2s;
        }
        .btn-danger:hover { background: rgba(232,69,69,0.2); }

        /* ── Search & Filter Bar ── */
        .filter-bar { display: flex; gap: 10px; margin-bottom: 16px; }
        .search-input {
          flex: 1; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 9px 14px;
          color: #fff; font-size: 13px;
          font-family: 'DM Sans', sans-serif; outline: none;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.2); }
        .filter-select {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 9px 14px;
          color: #fff; font-size: 13px; outline: none; cursor: pointer;
        }
        .filter-select option { background: #14141f; }

        /* ── Table ── */
        .table-wrap {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden;
        }
        table { width: 100%; border-collapse: collapse; }
        th {
          padding: 12px 16px; text-align: left;
          font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase; letter-spacing: 1px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02);
        }
        td { padding: 13px 16px; font-size: 13px; border-bottom: 1px solid rgba(255,255,255,0.03); }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(255,255,255,0.02); }
        .td-name { font-weight: 600; font-size: 14px; }
        .td-meta { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px; }

        /* ── Timetable ── */
        .timetable-wrap { overflow-x: auto; }
        .tt-table { width: 100%; border-collapse: collapse; min-width: 700px; }
        .tt-table th { padding: 10px 12px; font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 1px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
        }
        .tt-table td {
          padding: 0; border: 1px solid rgba(255,255,255,0.04);
          height: 52px; cursor: pointer; position: relative;
        }
        .tt-cell {
          width: 100%; height: 100%; display: flex;
          align-items: center; justify-content: center;
          font-size: 11px; font-weight: 600;
          transition: filter 0.2s;
        }
        .tt-cell:hover { filter: brightness(1.3); }
        .tt-day-label {
          font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.6);
          padding: 0 14px; text-align: center;
        }
        .tt-period-select {
          position: absolute; inset: 0; z-index: 10;
          background: #14141f; border: 1px solid rgba(255,255,255,0.15);
          color: #fff; font-size: 12px; padding: 0 8px; outline: none;
          cursor: pointer;
        }

        /* ── Fee Bar ── */
        .fee-bar-bg {
          width: 100%; height: 5px; background: rgba(255,255,255,0.06);
          border-radius: 3px; overflow: hidden; margin-top: 4px;
        }
        .fee-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s ease; }

        /* ── Staff Allocation ── */
        .alloc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
        .alloc-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: 18px;
        }
        .alloc-subject { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 6px; }
        .alloc-staff-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.06); border-radius: 8px;
          padding: 4px 10px; font-size: 12px; margin-top: 6px;
        }

        /* ── Modal Form ── */
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
        .btn-submit {
          background: linear-gradient(135deg, #e84545, #f5a623);
          border: none; color: #fff; padding: 11px 24px;
          border-radius: 10px; font-weight: 600; font-size: 14px;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-submit:hover { opacity: 0.9; transform: translateY(-1px); }
        .btn-cancel {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6); padding: 11px 24px;
          border-radius: 10px; font-size: 14px; cursor: pointer;
        }

        @media (max-width: 900px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .alloc-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .stats-grid { grid-template-columns: 1fr; }
          .form-row { grid-template-columns: 1fr; }
          .sidebar { display: none; }
        }
      `}</style>

      <div className="admin-root">
        {/* ── Sidebar ─────────────────────────── */}
        <aside className={`sidebar ${sidebarOpen ? "" : "collapsed"}`}>
          <div className="sidebar-brand">
            <img src={appLogo} alt="Logo" className="brand-icon" style={{ background:"#fff", objectFit:"contain", padding:"2px", borderRadius:"8px", width:"36px", height:"36px" }} />
            {sidebarOpen && <div className="brand-text">BHC ERP</div>}
          </div>

          {sidebarOpen && <div className="nav-section-label">Management</div>}

          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </button>
          ))}

          <div className="sidebar-footer">
            <div className="admin-tag">
              <div className="admin-avatar">👤</div>
              {sidebarOpen && (
                <div className="admin-info">
                  <div className="admin-name">{user?.name || "Admin"}</div>
                  <div className="admin-role">{user?.role === "ADMIN" ? "System Administrator" : user?.username}</div>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                style={{
                  marginTop: 14, width: "100%",
                  background: "rgba(232,69,69,0.1)",
                  border: "1px solid rgba(232,69,69,0.2)",
                  color: "#e84545", padding: "9px 0",
                  borderRadius: 10, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13, fontWeight: 600,
                  transition: "all 0.2s",
                }}
                onMouseOver={e => e.target.style.background = "rgba(232,69,69,0.2)"}
                onMouseOut={e => e.target.style.background = "rgba(232,69,69,0.1)"}
              >
                🚪 Logout
              </button>
            )}
          </div>
        </aside>

        {/* ── Main ─────────────────────────────── */}
        <div className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-left">
              <button className="menu-btn" onClick={() => setSidebarOpen(o => !o)}>☰</button>
              <span className="page-title">
                {navItems.find(n => n.id === activeTab)?.label || "Dashboard"}
              </span>
            </div>
            <div className="topbar-right">
              <span className="topbar-badge">Admin Access</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="content-area">

            {/* ── DASHBOARD ──────────────────────── */}
            {activeTab === "dashboard" && (() => {
              const studentCount = users.filter(u => u.role === "STUDENT").length;
              const staffCount = users.filter(u => u.role === "STAFF").length;
              const feesCollected = fees.reduce((sum, s) => sum + s.paid, 0);
              const feesPending = fees.reduce((sum, s) => sum + s.balance, 0);
              const feesTotal = feesCollected + feesPending;
              const collectedPct = feesTotal > 0 ? Math.round((feesCollected / feesTotal) * 100) : 0;
              const pendingPct = feesTotal > 0 ? Math.round((feesPending / feesTotal) * 100) : 0;

              const dynamicStats = [
                { label: "Total Students", value: studentCount.toString(), icon: "🎓", change: "Updated live", color: "#4a90e2" },
                { label: "Total Staff",    value: staffCount.toString(),    icon: "👨‍🏫", change: "Updated live",  color: "#f5a623" },
                { label: "Fees Collected", value: `₹${(feesCollected/100000).toFixed(1)}L`,  icon: "💰", change: `${collectedPct}% collected`,   color: "#7ed321" },
                { label: "Fees Pending",   value: `₹${(feesPending/100000).toFixed(1)}L`,  icon: "⚠️", change: `${pendingPct}% pending`,    color: "#e84545" },
              ];

              return (
              <>
                <div className="stats-grid">
                  {dynamicStats.map(s => (
                    <div className="stat-card" key={s.label}>
                      <div className="stat-top">
                        <div>
                          <div className="stat-label">{s.label}</div>
                          <div className="stat-val" style={{ color: s.color }}>{s.value}</div>
                        </div>
                        <div style={{ fontSize: 28 }}>{s.icon}</div>
                      </div>
                      <div className="stat-change">{s.change}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* Recent Users */}
                  <div className="table-wrap">
                    <div style={{ padding: "16px 20px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 14, marginBottom: 0 }}>
                      <span className="section-title">Recent Users</span>
                    </div>
                    <table>
                      <tbody>
                        {users.slice(0, 4).map(u => (
                          <tr key={u.id}>
                            <td>
                              <div className="td-name">{u.name}</div>
                              <div className="td-meta">{u.dept} · {u.username}</div>
                            </td>
                            <td><Badge role={u.role} /></td>
                            <td><StatusDot active={u.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Fees Summary */}
                  <div className="table-wrap">
                    <div style={{ padding: "16px 20px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="section-title">Fees Overview</span>
                    </div>
                    <table>
                      <tbody>
                        {fees.slice(0, 4).map(f => {
                          const pct = Math.round((f.paid / f.allocated) * 100);
                          return (
                            <tr key={f.id}>
                              <td>
                                <div className="td-name">{f.student}</div>
                                <div className="td-meta">{f.feeType} · {f.regNo}</div>
                                <div className="fee-bar-bg">
                                  <div className="fee-bar-fill" style={{
                                    width: `${pct}%`,
                                    background: pct === 100 ? "#7ed321" : pct > 50 ? "#f5a623" : "#e84545"
                                  }} />
                                </div>
                              </td>
                              <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>₹{f.paid.toLocaleString("en-IN")}</div>
                                <div className="td-meta">of ₹{f.allocated.toLocaleString("en-IN")}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
              );
            })()}

            {/* ── USER MANAGEMENT ─────────────────── */}
            {activeTab === "users" && (
              <>
                <div className="section-header">
                  <div>
                    <div className="section-title">User Management</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>{users.length} total users</div>
                  </div>
                  <button className="btn-primary" onClick={() => setShowAddUser(true)}>＋ Add User</button>
                </div>

                <div className="filter-bar">
                  <input
                    className="search-input"
                    placeholder="🔍  Search by name or username..."
                    value={search} onChange={e => setSearch(e.target.value)}
                  />
                  <select className="filter-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                    <option value="ALL">All Roles</option>
                    <option value="STAFF">Staff</option>
                    <option value="STUDENT">Student</option>
                  </select>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Details</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td>
                            <div className="td-name">{u.name}</div>
                            <div className="td-meta">{u.username} · {u.email}</div>
                          </td>
                          <td><Badge role={u.role} /></td>
                          <td><span style={{ fontSize: 13 }}>{u.dept}</span></td>
                          <td>
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                              {u.role === "STUDENT" ? `Reg: ${u.regNo} · Sem ${u.sem}` : `Code: ${u.staffCode}`}
                            </span>
                          </td>
                          <td><StatusDot active={u.status} /></td>
                          <td>
                            <div style={{ display: "flex", gap: 6 }}>
                              <button className="btn-ghost" onClick={() => toggleUserStatus(u.id)}>
                                {u.status ? "Disable" : "Enable"}
                              </button>
                              <button className="btn-danger" onClick={() => deleteUser(u.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: "center", color: "rgba(255,255,255,0.25)", padding: 40 }}>No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── FEES MANAGEMENT ─────────────────── */}
            {activeTab === "fees" && (
              <>
                <div className="section-header">
                  <div>
                    <div className="section-title">Fees Management</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>AY 2024-25 · Live data from all portals</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn-ghost" onClick={refreshFees}>🔄 Refresh</button>
                    <button className="btn-primary" onClick={() => setShowAddFee(true)}>＋ Allocate Fee</button>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Fee Type</th>
                        <th>Allocated</th>
                        <th>Paid</th>
                        <th>Balance</th>
                        <th>Progress</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.map(st => {
                        const isExp = !!expandedStudents[st.regNo];
                        return (
                          <React.Fragment key={st.id}>
                            {/* Parent Row */}
                            <tr style={{ background: isExp ? "rgba(255,255,255,0.02)" : "transparent", cursor: "pointer", transition: "all 0.2s" }} onClick={() => setExpandedStudents(p => ({ ...p, [st.regNo]: !isExp }))}>
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div style={{ transform: isExp ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>▶</div>
                                  <div>
                                    <div className="td-name">{st.student}</div>
                                    <div className="td-meta">{st.regNo} · {st.dept}</div>
                                  </div>
                                </div>
                              </td>
                              <td><span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{st.details.length} Items</span></td>
                              <td style={{ fontWeight: 600 }}>₹{st.allocated.toLocaleString("en-IN")}</td>
                              <td style={{ color: "#7ed321", fontWeight: 600 }}>₹{st.paid.toLocaleString("en-IN")}</td>
                              <td style={{ color: st.balance > 0 ? "#e84545" : "#7ed321", fontWeight: 600 }}>
                                ₹{st.balance.toLocaleString("en-IN")}
                              </td>
                              <td style={{ minWidth: 100 }}>
                                <div style={{ fontSize: 11, marginBottom: 3, color: "rgba(255,255,255,0.4)" }}>{st.pct}%</div>
                                <div className="fee-bar-bg">
                                  <div className="fee-bar-fill" style={{ width: `${st.pct}%`, background: st.pct === 100 ? "#7ed321" : st.pct > 50 ? "#f5a623" : "#e84545" }} />
                                </div>
                              </td>
                              <td>
                                <span style={{
                                  background: st.balance === 0 ? "rgba(126,211,33,0.12)" : "rgba(232,69,69,0.12)",
                                  color: st.balance === 0 ? "#7ed321" : "#e84545",
                                  border: `1px solid ${st.balance === 0 ? "rgba(126,211,33,0.3)" : "rgba(232,69,69,0.3)"}`,
                                  borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700
                                }}>
                                  {st.balance === 0 ? "PAID" : "PENDING"}
                                </span>
                              </td>
                            </tr>
                            {/* Child Rows (Dropdown) */}
                            {isExp && st.details.map(f => {
                              const bal = f.allocated - f.paid;
                              const fpct = Math.round((f.paid / f.allocated) * 100);
                              return (
                                <tr key={f.id} style={{ background: "rgba(255,255,255,0.01)" }}>
                                  <td style={{ paddingLeft: 46 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                      <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />
                                      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>└</span>
                                    </div>
                                  </td>
                                  <td><span style={{ fontSize: 13 }}>{f.type.replace(" Fee", "")}</span></td>
                                  <td style={{ fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.8)" }}>₹{f.allocated.toLocaleString("en-IN")}</td>
                                  <td style={{ color: "rgba(126,211,33,0.8)", fontWeight: 600, fontSize: 13 }}>₹{f.paid.toLocaleString("en-IN")}</td>
                                  <td style={{ color: bal > 0 ? "rgba(232,69,69,0.8)" : "rgba(126,211,33,0.8)", fontWeight: 600, fontSize: 13 }}>
                                    ₹{bal.toLocaleString("en-IN")}
                                  </td>
                                  <td style={{ minWidth: 100, paddingRight: 40 }}>
                                    <div className="fee-bar-bg" style={{ height: 4 }}>
                                      <div className="fee-bar-fill" style={{ width: `${fpct}%`, background: fpct === 100 ? "#7ed321" : fpct > 50 ? "#f5a623" : "#e84545" }} />
                                    </div>
                                  </td>
                                  <td></td>
                                </tr>
                              )
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── TIMETABLE ───────────────────────── */}
            {activeTab === "timetable" && (
              <>
                <div className="section-header">
                  <div>
                    <div className="section-title">Class Timetable</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>CSE · Semester 6 · Click any cell to edit</div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {Object.entries(subjectColors).filter(([k]) => k).slice(0, 4).map(([subj, color]) => (
                      <span key={subj} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.5)" }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }} />{subj.split(" ")[0]}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="table-wrap timetable-wrap">
                  <table className="tt-table">
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>Day</th>
                        {periods.map(p => <th key={p}>{p}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map(day => (
                        <tr key={day}>
                          <td><div className="tt-day-label">{day}</div></td>
                          {(timetable[day] || []).map((subj, idx) => (
                            <td key={idx} onClick={() => setEditTimetableCell({ day, idx })}>
                              {editTimetableCell?.day === day && editTimetableCell?.idx === idx ? (
                                <select
                                  className="tt-period-select"
                                  autoFocus
                                  defaultValue={subj}
                                  onChange={e => handleTimetableChange(day, idx, e.target.value)}
                                  onBlur={() => setEditTimetableCell(null)}
                                >
                                  <option value="">-- Free --</option>
                                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              ) : (
                                <div
                                  className="tt-cell"
                                  style={{
                                    background: subj ? `${subjectColors[subj]}22` : "transparent",
                                    color: subj ? subjectColors[subj] : "rgba(255,255,255,0.1)",
                                  }}
                                >
                                  {subj || "—"}
                                </div>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── STAFF ALLOCATION ────────────────── */}
            {activeTab === "staff-alloc" && (
              <>
                <div className="section-header">
                  <div>
                    <div className="section-title">Staff–Subject Allocation</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 3 }}>CSE Department · Semester 6</div>
                  </div>
                  <button className="btn-primary">＋ Assign Staff</button>
                </div>

                <div className="alloc-grid">
                  {subjects.map((subj, i) => {
                    const staffList = ["Dr. Ramesh Kumar", "Prof. Meena Devi", "Dr. Anand Raj", "Prof. Kavitha S", "Dr. Suresh M", "Prof. Geetha R"];
                    const color = Object.values(subjectColors)[i] || "#4a90e2";
                    return (
                      <div className="alloc-card" key={subj} style={{ borderLeft: `3px solid ${color}` }}>
                        <div className="alloc-subject" style={{ color }}>{subj}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>3 Credits · Theory</div>
                        <div className="alloc-staff-tag">
                          <span>👨‍🏫</span>
                          <span>{staffList[i]}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                          <button className="btn-ghost">Change Staff</button>
                          <button className="btn-ghost">View Details</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── ADD USER MODAL ─────────────────────── */}
        {showAddUser && (
          <Modal title="Add New User" onClose={() => setShowAddUser(false)}>
            <div className="form-row">
              <FormInput label="Full Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="e.g. Arjun Selvan" />
              <FormInput label="Username / Reg No." value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} placeholder="e.g. 21CSE001" />
            </div>
            <FormInput label="Email" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="user@college.edu" />
            <div className="form-row">
              <FormInput label="Role" type="select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} options={["STUDENT", "STAFF", "ADMIN"]} />
              <FormInput label="Department" type="select" value={newUser.dept} onChange={e => setNewUser({ ...newUser, dept: e.target.value })} options={["CSE", "ECE", "MECH", "CIVIL"]} />
            </div>
            <FormInput label="Password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Set initial password" />
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAddUser(false)}>Cancel</button>
              <button className="btn-submit" onClick={handleAddUser}>Add User</button>
            </div>
          </Modal>
        )}

        {/* ── ADD FEE MODAL ──────────────────────── */}
        {showAddFee && (
          <Modal title="Allocate Fee" onClose={() => setShowAddFee(false)}>
            <div className="form-row">
              <FormInput label="Student Name" value={newFee.student} onChange={e => setNewFee({ ...newFee, student: e.target.value })} placeholder="Full name" />
              <FormInput label="Register No." value={newFee.regNo} onChange={e => setNewFee({ ...newFee, regNo: e.target.value })} placeholder="e.g. 21CSE001" />
            </div>
            <div className="form-row">
              <FormInput label="Fee Type" type="select" value={newFee.feeType} onChange={e => setNewFee({ ...newFee, feeType: e.target.value })} options={["Tuition", "Transport", "Hostel", "Exam", "Lab"]} />
              <FormInput label="Department" type="select" value={newFee.dept} onChange={e => setNewFee({ ...newFee, dept: e.target.value })} options={["CSE", "ECE", "MECH", "CIVIL"]} />
            </div>
            <div className="form-row">
              <FormInput label="Amount (₹)" type="number" value={newFee.allocated} onChange={e => setNewFee({ ...newFee, allocated: e.target.value })} placeholder="e.g. 45000" />
              <FormInput label="Academic Year" type="select" value={newFee.year} onChange={e => setNewFee({ ...newFee, year: e.target.value })} options={["2024-25", "2025-26"]} />
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowAddFee(false)}>Cancel</button>
              <button className="btn-submit" onClick={handleAddFee}>Allocate</button>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
}
