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

const ADMIN_USER = {
  id: 1,
  name: "System Administrator",
  username: "admin",
  email: "admin@bhcollege.edu",
  password: "admin@123",
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

/** Validate login — checks username + password + role against store */
export function validateLogin(username, password, role) {
  const users = loadAllUsers();
  const found = users.find(
    u => u.username === username && u.password === password && u.role === role && u.status !== false
  );
  return found || null;
}
