-- ============================================================
-- COLLEGE ERP SYSTEM - MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS college_erp;
USE college_erp;

-- ============================================================
-- 1. USERS TABLE (Admin, Staff, Student accounts)
-- ============================================================
CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,           -- BCrypt hashed
    email       VARCHAR(150) UNIQUE,
    role        ENUM('ADMIN', 'STAFF', 'STUDENT') NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. DEPARTMENTS
-- ============================================================
CREATE TABLE departments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(10)  NOT NULL UNIQUE,    -- e.g. CSE, ECE, MECH
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. STAFF DETAILS
-- ============================================================
CREATE TABLE staff (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    staff_code      VARCHAR(20) NOT NULL UNIQUE, -- e.g. STF001
    name            VARCHAR(150) NOT NULL,
    department_id   BIGINT NOT NULL,
    designation     VARCHAR(100),               -- Professor, Asst. Professor
    phone           VARCHAR(15),
    address         TEXT,
    joining_date    DATE,
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- ============================================================
-- 4. STUDENTS
-- ============================================================
CREATE TABLE students (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    register_no     VARCHAR(20) NOT NULL UNIQUE, -- e.g. 21CSE001
    name            VARCHAR(150) NOT NULL,
    department_id   BIGINT NOT NULL,
    current_semester TINYINT NOT NULL DEFAULT 1 CHECK (current_semester BETWEEN 1 AND 8),
    batch           VARCHAR(10) NOT NULL,        -- e.g. 2021-2025
    dob             DATE,
    phone           VARCHAR(15),
    parent_phone    VARCHAR(15),
    address         TEXT,
    admitted_date   DATE,
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- ============================================================
-- 5. SUBJECTS
-- ============================================================
CREATE TABLE subjects (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(20)  NOT NULL UNIQUE,  -- e.g. CS301
    department_id   BIGINT NOT NULL,
    semester        TINYINT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    credits         TINYINT DEFAULT 3,
    subject_type    ENUM('THEORY','LAB','ELECTIVE') DEFAULT 'THEORY',
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- ============================================================
-- 6. CLASS PERIODS / TIMETABLE
-- ============================================================
CREATE TABLE class_periods (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id      BIGINT NOT NULL,
    staff_id        BIGINT NOT NULL,
    department_id   BIGINT NOT NULL,
    semester        TINYINT NOT NULL,
    day_of_week     ENUM('MON','TUE','WED','THU','FRI','SAT') NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    room_no         VARCHAR(20),
    academic_year   VARCHAR(10) NOT NULL,        -- e.g. 2024-2025
    FOREIGN KEY (subject_id)    REFERENCES subjects(id),
    FOREIGN KEY (staff_id)      REFERENCES staff(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- ============================================================
-- 7. ATTENDANCE (Hour-based)
-- ============================================================
CREATE TABLE attendance (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    class_period_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status          ENUM('PRESENT','ABSENT','OD','LATE') NOT NULL DEFAULT 'ABSENT',
    marked_by       BIGINT NOT NULL,             -- staff id
    marked_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)     REFERENCES students(id)     ON DELETE CASCADE,
    FOREIGN KEY (class_period_id)REFERENCES class_periods(id),
    FOREIGN KEY (marked_by)      REFERENCES staff(id),
    UNIQUE KEY uq_attendance (student_id, class_period_id, attendance_date)
);

-- ============================================================
-- 8. CIA MARKS (Continuous Internal Assessment)
-- Each semester has multiple CIA exams
-- ============================================================
CREATE TABLE cia_marks (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    subject_id      BIGINT NOT NULL,
    semester        TINYINT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    cia_number      TINYINT NOT NULL CHECK (cia_number IN (1,2,3)),  -- CIA 1,2,3
    marks_obtained  DECIMAL(5,2) NOT NULL DEFAULT 0,
    max_marks       DECIMAL(5,2) NOT NULL DEFAULT 50,
    entered_by      BIGINT NOT NULL,             -- staff id
    entered_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)    REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id)    REFERENCES subjects(id),
    FOREIGN KEY (entered_by)    REFERENCES staff(id),
    UNIQUE KEY uq_cia (student_id, subject_id, semester, cia_number)
);

-- ============================================================
-- 9. SEMESTER MARKS (End Semester Exam)
-- ============================================================
CREATE TABLE semester_marks (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    subject_id      BIGINT NOT NULL,
    semester        TINYINT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    marks_obtained  DECIMAL(5,2) NOT NULL DEFAULT 0,
    max_marks       DECIMAL(5,2) NOT NULL DEFAULT 100,
    grade           VARCHAR(5),                  -- A+, A, B, C, F
    result          ENUM('PASS','FAIL','WITHHELD') DEFAULT 'FAIL',
    entered_by      BIGINT NOT NULL,
    entered_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)    REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id)    REFERENCES subjects(id),
    FOREIGN KEY (entered_by)    REFERENCES staff(id),
    UNIQUE KEY uq_sem_marks (student_id, subject_id, semester)
);

-- ============================================================
-- 10. FEES CATEGORIES
-- ============================================================
CREATE TABLE fee_categories (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,       -- Tuition, Transport, Hostel
    amount          DECIMAL(10,2) NOT NULL,
    semester        TINYINT,                     -- NULL = annual fee
    academic_year   VARCHAR(10) NOT NULL,
    due_date        DATE
);

-- ============================================================
-- 11. FEES ALLOCATION (per student)
-- ============================================================
CREATE TABLE fee_allocations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    fee_category_id BIGINT NOT NULL,
    allocated_amount DECIMAL(10,2) NOT NULL,
    academic_year   VARCHAR(10) NOT NULL,
    allocated_by    BIGINT NOT NULL,             -- admin user id
    allocated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)     REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_category_id)REFERENCES fee_categories(id),
    FOREIGN KEY (allocated_by)   REFERENCES users(id),
    UNIQUE KEY uq_fee_alloc (student_id, fee_category_id, academic_year)
);

-- ============================================================
-- 12. FEES PAYMENTS
-- ============================================================
CREATE TABLE fee_payments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    fee_category_id BIGINT NOT NULL,
    amount_paid     DECIMAL(10,2) NOT NULL,
    payment_date    DATE NOT NULL,
    payment_mode    ENUM('CASH','ONLINE','CHEQUE','DD') DEFAULT 'CASH',
    transaction_id  VARCHAR(100),
    receipt_no      VARCHAR(50) NOT NULL UNIQUE, -- e.g. RCP2024001
    academic_year   VARCHAR(10) NOT NULL,
    received_by     BIGINT NOT NULL,             -- admin/staff user id
    remarks         TEXT,
    FOREIGN KEY (student_id)     REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_category_id)REFERENCES fee_categories(id),
    FOREIGN KEY (received_by)    REFERENCES users(id)
);

-- ============================================================
-- VIEWS FOR EASY REPORTING
-- ============================================================

-- Attendance Summary per Student per Subject
CREATE VIEW v_attendance_summary AS
SELECT
    s.register_no,
    s.name          AS student_name,
    sub.code        AS subject_code,
    sub.name        AS subject_name,
    COUNT(a.id)     AS total_classes,
    SUM(CASE WHEN a.status IN ('PRESENT','OD') THEN 1 ELSE 0 END) AS attended,
    ROUND(
        SUM(CASE WHEN a.status IN ('PRESENT','OD') THEN 1 ELSE 0 END) * 100.0 / COUNT(a.id), 2
    )               AS attendance_percentage
FROM students s
JOIN attendance a    ON a.student_id = s.id
JOIN class_periods cp ON cp.id = a.class_period_id
JOIN subjects sub    ON sub.id = cp.subject_id
GROUP BY s.id, sub.id;

-- CIA + Semester Marks Summary
CREATE VIEW v_marks_summary AS
SELECT
    s.register_no,
    s.name          AS student_name,
    s.current_semester AS semester,
    sub.code        AS subject_code,
    sub.name        AS subject_name,
    MAX(CASE WHEN cm.cia_number=1 THEN cm.marks_obtained END) AS cia1,
    MAX(CASE WHEN cm.cia_number=2 THEN cm.marks_obtained END) AS cia2,
    MAX(CASE WHEN cm.cia_number=3 THEN cm.marks_obtained END) AS cia3,
    sm.marks_obtained AS semester_marks,
    sm.grade,
    sm.result
FROM students s
JOIN subjects sub    ON sub.department_id = s.department_id
                     AND sub.semester = s.current_semester
LEFT JOIN cia_marks cm      ON cm.student_id = s.id AND cm.subject_id = sub.id
LEFT JOIN semester_marks sm ON sm.student_id = s.id AND sm.subject_id = sub.id
GROUP BY s.id, sub.id, sm.id;

-- Fees Due Summary
CREATE VIEW v_fees_due AS
SELECT
    s.register_no,
    s.name          AS student_name,
    fc.name         AS fee_type,
    fa.allocated_amount,
    COALESCE(SUM(fp.amount_paid), 0) AS amount_paid,
    fa.allocated_amount - COALESCE(SUM(fp.amount_paid), 0) AS balance_due,
    fa.academic_year
FROM students s
JOIN fee_allocations fa ON fa.student_id = s.id
JOIN fee_categories  fc ON fc.id = fa.fee_category_id
LEFT JOIN fee_payments fp ON fp.student_id = s.id
                          AND fp.fee_category_id = fa.fee_category_id
                          AND fp.academic_year = fa.academic_year
GROUP BY s.id, fa.id;

-- ============================================================
-- SEED DATA - Default Admin User
-- Password: admin@123 (BCrypt hashed)
-- ============================================================
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'admin@college.edu', 'ADMIN');

INSERT INTO departments (name, code) VALUES
('Computer Science & Engineering', 'CSE'),
('Electronics & Communication Engineering', 'ECE'),
('Mechanical Engineering', 'MECH'),
('Civil Engineering', 'CIVIL');

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_attendance_student   ON attendance(student_id, attendance_date);
CREATE INDEX idx_cia_student_subject  ON cia_marks(student_id, subject_id, semester);
CREATE INDEX idx_sem_student_subject  ON semester_marks(student_id, subject_id, semester);
CREATE INDEX idx_fee_student          ON fee_payments(student_id, academic_year);
CREATE INDEX idx_timetable            ON class_periods(department_id, semester, day_of_week);
