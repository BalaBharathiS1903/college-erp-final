const STORAGE_KEY = "erp_users";

const DEFAULT_USERS = [
  { id: 1, name: "Dr. Ramesh Kumar",    username: "ramesh.k", email: "ramesh@college.edu",  role: "STAFF",   dept: "CSE",   status: true,  staffCode: "STF001", isCoe: true, phone: "+91 98765 11111", dob: "01 Jan 1975", advisor: null, address: "Staff Quarters, College Rd" },
  { id: 2, name: "Prof. Meena Devi",    username: "meena.d",  email: "meena@college.edu",   role: "STAFF",   dept: "ECE",   status: true,  staffCode: "STF002", phone: "+91 98765 22222", dob: "15 Feb 1980", advisor: null, address: "Staff Quarters, College Rd" },
  { id: 3, name: "Arjun Selvan",        username: "21CSE001", email: "arjun@student.edu",   role: "STUDENT", dept: "CSE",   status: true,  regNo: "21CSE001", sem: 6, isCoe: false, batch: "2021-2025", phone: "+91 98765 43210", dob: "12 March 2003", advisor: "Dr. Ramesh Kumar", address: "123 Main St, Trichy" },
  { id: 4, name: "Priya Lakshmi",       username: "21CSE002", email: "priya@student.edu",   role: "STUDENT", dept: "CSE",   status: true,  regNo: "21CSE002", sem: 6, isCoe: false, batch: "2021-2025", phone: "+91 98765 43211", dob: "25 July 2003", advisor: "Dr. Ramesh Kumar", address: "456 West St, Madurai" },
  { id: 5, name: "Karthik Murugan",     username: "22ECE001", email: "karthik@student.edu", role: "STUDENT", dept: "ECE",   status: false, regNo: "22ECE001", sem: 4, isCoe: false, batch: "2022-2026", phone: "+91 98765 43212", dob: "10 Jan 2004", advisor: "Prof. Meena Devi", address: "789 East St, Chennai" },
];

export function loadAllUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load users from localStorage", e);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
  return DEFAULT_USERS;
}

export function saveAllUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}
