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
      // Ensure admin is always present with current password from env
      const adminExists = parsed.find(u => u.role === "ADMIN");
      if (!adminExists) {
        console.log('⚠️ No admin found - adding default admin');
        const withAdmin = [ADMIN_USER, ...parsed];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(withAdmin));
        return withAdmin;
      }
      // Update admin password if env changed
      const updatedUsers = parsed.map(u => 
        u.role === "ADMIN" && u.username === "admin" 
          ? { ...u, password: DEFAULT_ADMIN_PASSWORD }
          : u
      );
      if (JSON.stringify(updatedUsers) !== JSON.stringify(parsed)) {
        console.log('🔄 Admin password updated from environment');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUsers));
      }
      return updatedUsers;
    }
  } catch (e) {
    console.error("Failed to load users", e);
  }
  // First run: seed with just admin
  console.log('✨ Initializing with default admin user');
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
  
  // Debug logging
  console.log('🔍 Validating login:', { username, role });
  console.log('📋 Available users:', users.map(u => ({ username: u.username, role: u.role })));
  
  // Match by username (case-insensitive) + password + role
  const found = users.find(
    u => u.username.toLowerCase() === username.toLowerCase() &&
         safeEqual(u.password, password) &&
         u.role === role &&
         u.status !== false
  );

  if (found) {
    console.log('✅ Login successful');
    return found;
  }
  
  console.log('❌ Login failed');
  return null;
}
