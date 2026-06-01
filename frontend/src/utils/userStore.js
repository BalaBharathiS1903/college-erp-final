/**
 * userStore.js — Central user registry.
 * 
 * On first load, ONLY the admin account exists.
 * All other users (staff, students) must be added by the admin
 * through the Admin Dashboard.
 * 
 * Users stored:
 *   { id, name, username, email, password, role, dept, status,
 *     regNo?, sem?, batch?, phone?, dob?, advisor?, address?,
 *     staffCode?, isCoe?, ... }
 */

const STORAGE_KEY = "erp_users";

// Default admin password is read from env; falls back to a placeholder that
// must be changed on first login. Never commit real credentials here.
const DEFAULT_ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_DEFAULT_PASSWORD || "ChangeMe@First1";

const ADMIN_USER = {
  id: 1,
  name: "System Administrator",
  username: "admin",
  email: "admin@bhcollege.edu",
  password: DEFAULT_ADMIN_PASSWORD,
  role: "ADMIN",
  dept: "ADMIN",
  status: true,
  phone: "",
  dob: "",
  address: "",
};

export function loadAllUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure admin is always present
      if (!parsed.find(u => u.role === "ADMIN")) {
        const withAdmin = [ADMIN_USER, ...parsed];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(withAdmin));
        return withAdmin;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Failed to load users", e);
  }
  // First run: seed with just admin
  localStorage.setItem(STORAGE_KEY, JSON.stringify([ADMIN_USER]));
  return [ADMIN_USER];
}

export function saveAllUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

/** Timing-safe string comparison to prevent timing attacks (CWE-208). */
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) {
    // Still iterate to avoid length-based timing leak
    let diff = 0;
    for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Validate login — checks username + password + role against store */
export function validateLogin(username, password, role) {
  const users = loadAllUsers();
  const found = users.find(
    u => safeEqual(u.username, username) && safeEqual(u.password, password) && u.role === role && u.status !== false
  );
  return found || null;
}
