const COLLEGE_CONFIG_KEY = "erp_college_config";

const DEFAULT_CONFIG = {
    subjects: [
        { id: 1, code: "CS601", name: "Data Structures", credits: 3, sem: 6, dept: "CSE" },
        { id: 2, code: "CS602", name: "DBMS",            credits: 4, sem: 6, dept: "CSE" },
        { id: 3, code: "CS603", name: "Operating Systems", credits: 3, sem: 6, dept: "CSE" },
        { id: 4, code: "CS604", name: "Computer Networks", credits: 3, sem: 6, dept: "CSE" },
        { id: 5, code: "CS605", name: "Software Engineering", credits: 3, sem: 6, dept: "CSE" },
        { id: 6, code: "MA301", name: "Maths III",       credits: 4, sem: 6, dept: "CSE" },
    ],
    timetable: {
        MON: ["Data Structures", "DBMS", "Operating Systems", "", "Computer Networks", "Software Engineering"],
        TUE: ["Operating Systems", "Computer Networks", "Data Structures", "", "Maths III", "DBMS"],
        WED: ["Maths III", "Software Engineering", "", "Computer Networks", "Data Structures", ""],
        THU: ["Computer Networks", "Data Structures", "DBMS", "", "Software Engineering", "Operating Systems"],
        FRI: ["DBMS", "Maths III", "Software Engineering", "", "Operating Systems", "Computer Networks"],
    },
    subjectColors: {
        "Data Structures": "#e84545",
        "DBMS":            "#f5a623",
        "Operating Systems": "#4a90e2",
        "Computer Networks": "#7ed321",
        "Software Engineering": "#bd10e0",
        "Maths III":       "#50e3c2",
        "":                "transparent",
    }
};

export function loadCollegeConfig() {
    try {
        const raw = localStorage.getItem(COLLEGE_CONFIG_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.error("Failed to load college config", e);
    }
    return DEFAULT_CONFIG;
}

export function saveCollegeConfig(config) {
    localStorage.setItem(COLLEGE_CONFIG_KEY, JSON.stringify(config));
}
