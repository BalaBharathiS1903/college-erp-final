/**
 * Shared Fee Store — persists to localStorage so data survives
 * page refreshes and is shared across Admin / Student portals.
 */

const STORAGE_KEY = "erp_fees";

// ── Default seed data (matches Admin + Student portals) ──────
const DEFAULT_FEES = {
  "21CSE001": [
    { id: 1, type: "Tuition Fee",   allocated: 45000, paid: 45000, year: "2024-25", receipts: [{ no: "RCP2024001", date: "12 Jun 2024", amount: 45000, mode: "Online" }] },
    { id: 2, type: "Transport Fee", allocated: 12000, paid: 12000, year: "2024-25", receipts: [{ no: "RCP2024002", date: "12 Jun 2024", amount: 12000, mode: "Online" }] },
    { id: 3, type: "Exam Fee",      allocated: 1500,  paid: 0,     year: "2024-25", receipts: [] },
    { id: 4, type: "Lab Fee",       allocated: 3000,  paid: 3000,  year: "2024-25", receipts: [{ no: "RCP2024003", date: "15 Jul 2024", amount: 3000, mode: "Cash" }] },
    { id: 5, type: "Tuition Fee",   allocated: 45000, paid: 45000, year: "2023-24", receipts: [{ no: "RCP2023001", date: "10 Jun 2023", amount: 45000, mode: "Online" }] },
  ],
  "21CSE002": [
    { id: 1, type: "Tuition Fee",   allocated: 45000, paid: 30000, year: "2024-25", receipts: [{ no: "RCP2024010", date: "20 Jun 2024", amount: 30000, mode: "Online" }] },
    { id: 2, type: "Transport Fee", allocated: 12000, paid: 12000, year: "2024-25", receipts: [{ no: "RCP2024011", date: "20 Jun 2024", amount: 12000, mode: "Online" }] },
    { id: 3, type: "Exam Fee",      allocated: 1500,  paid: 1500,  year: "2024-25", receipts: [{ no: "RCP2024012", date: "01 Jul 2024", amount: 1500, mode: "Cash" }] },
    { id: 4, type: "Lab Fee",       allocated: 3000,  paid: 0,     year: "2024-25", receipts: [] },
    { id: 5, type: "Tuition Fee",   allocated: 45000, paid: 45000, year: "2023-24", receipts: [{ no: "RCP2023010", date: "15 Jun 2023", amount: 45000, mode: "Online" }] },
  ],
};

/** Load all fee data (all students) */
export function loadAllFees() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* corrupted, fall through */ }
  // Seed default data on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FEES));
  return structuredClone(DEFAULT_FEES);
}

/** Load fees for a single student */
export function loadStudentFees(regNo) {
  const all = loadAllFees();
  return all[regNo] || [];
}

/** Save fees for a single student (after payment etc.) */
export function saveStudentFees(regNo, fees) {
  const all = loadAllFees();
  all[regNo] = fees;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/** Reset to defaults (for testing) */
export function resetFees() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FEES));
}
