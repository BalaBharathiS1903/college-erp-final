const ATTENDANCE_KEY = "erp_attendance";
const CIA_MARKS_KEY = "erp_cia_marks";
const SEM_MARKS_KEY = "erp_sem_marks";
const SESSIONS_KEY = "erp_staff_sessions";

export function loadAttendance(subjId, date) {
    try {
        const raw = localStorage.getItem(ATTENDANCE_KEY);
        if (raw) {
            const all = JSON.parse(raw);
            return all[`${subjId}_${date}`] || null;
        }
    } catch (e) {
        console.error("Failed to load attendance", e);
    }
    return null;
}

export function saveAttendance(subjId, date, data) {
    try {
        const raw = localStorage.getItem(ATTENDANCE_KEY);
        const all = raw ? JSON.parse(raw) : {};
        all[`${subjId}_${date}`] = data;
        localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(all));
    } catch (e) {
        console.error("Failed to save attendance", e);
    }
}

export function loadCIAMarks(subjId) {
    try {
        const raw = localStorage.getItem(CIA_MARKS_KEY);
        if (raw) {
            const all = JSON.parse(raw);
            return all[subjId] || null;
        }
    } catch (e) {
        console.error("Failed to load CIA marks", e);
    }
    return null;
}

export function saveCIAMarks(subjId, data) {
    try {
        const raw = localStorage.getItem(CIA_MARKS_KEY);
        const all = raw ? JSON.parse(raw) : {};
        all[subjId] = data;
        localStorage.setItem(CIA_MARKS_KEY, JSON.stringify(all));
    } catch (e) {
        console.error("Failed to save CIA marks", e);
    }
}

export function loadSemMarks(subjId) {
    try {
        const raw = localStorage.getItem(SEM_MARKS_KEY);
        if (raw) {
            const all = JSON.parse(raw);
            return all[subjId] || null;
        }
    } catch (e) {
        console.error("Failed to load Sem marks", e);
    }
    return null;
}

export function saveSemMarks(subjId, data) {
    try {
        const raw = localStorage.getItem(SEM_MARKS_KEY);
        const all = raw ? JSON.parse(raw) : {};
        all[subjId] = data;
        localStorage.setItem(SEM_MARKS_KEY, JSON.stringify(all));
    } catch (e) {
        console.error("Failed to save Sem marks", e);
    }
}

export function loadStaffSessions() {
    try {
        const raw = localStorage.getItem(SESSIONS_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to load sessions", e);
    }
    return [];
}

export function saveStaffSessions(sessions) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
