/**
 * feeStore.js — Shared Fee store.
 * 
 * Starts empty. Admin allocates fees via Admin Dashboard.
 * Fees are keyed by student username (regNo).
 */

const STORAGE_KEY = "erp_fees";

export function loadAllFees() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load fees", e);
  }
  return {};
}

export function saveAllFees(fees) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fees));
}

export function loadStudentFees(regNo) {
  if (!regNo) return [];
  const all = loadAllFees();
  return all[regNo] || [];
}

export function saveStudentFees(regNo, fees) {
  if (!regNo) return;
  const all = loadAllFees();
  all[regNo] = fees;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
