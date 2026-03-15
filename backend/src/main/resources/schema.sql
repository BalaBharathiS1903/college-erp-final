-- ============================================================
-- COLLEGE ERP SYSTEM - Database Schema (H2 compatible)
-- ============================================================

-- 1. USERS
CREATE TABLE users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    name        VARCHAR(100),
    email       VARCHAR(150) UNIQUE,
    role        VARCHAR(10) NOT NULL,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. DEPARTMENTS
CREATE TABLE departments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    code        VARCHAR(10)  NOT NULL UNIQUE,
    hod_name    VARCHAR(100),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. STAFF
CREATE TABLE staff (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    staff_code      VARCHAR(20) NOT NULL UNIQUE,
    department_id   BIGINT NOT NULL,
    designation     VARCHAR(100),
    phone           VARCHAR(15),
    address         TEXT,
    joining_date    DATE,
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 4. STUDENTS
CREATE TABLE students (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    register_no     VARCHAR(20) NOT NULL UNIQUE,
    department_id   BIGINT NOT NULL,
    current_semester TINYINT NOT NULL DEFAULT 1,
    batch           VARCHAR(10) NOT NULL,
    date_of_birth   DATE,
    phone           VARCHAR(15),
    parent_phone    VARCHAR(15),
    address         TEXT,
    admitted_date   DATE,
    FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 5. SUBJECTS
CREATE TABLE subjects (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(20)  NOT NULL UNIQUE,
    department_id   BIGINT NOT NULL,
    semester        TINYINT NOT NULL,
    credits         TINYINT DEFAULT 3,
    subject_type    VARCHAR(20) DEFAULT 'THEORY',
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 6. CLASS PERIODS / TIMETABLE
CREATE TABLE class_periods (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_id      BIGINT NOT NULL,
    staff_id        BIGINT NOT NULL,
    department_id   BIGINT NOT NULL,
    semester        TINYINT NOT NULL,
    day_of_week     VARCHAR(5) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    room_no         VARCHAR(20),
    academic_year   VARCHAR(10) NOT NULL,
    FOREIGN KEY (subject_id)    REFERENCES subjects(id),
    FOREIGN KEY (staff_id)      REFERENCES staff(id),
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- 7. ATTENDANCE (matches Attendance.java entity: subject_id, staff_id, date, period_number)
CREATE TABLE attendance (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    subject_id      BIGINT NOT NULL,
    staff_id        BIGINT NOT NULL,
    date            DATE NOT NULL,
    period_number   INT NOT NULL,
    status          VARCHAR(10) NOT NULL DEFAULT 'A',
    FOREIGN KEY (student_id)    REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id)    REFERENCES subjects(id),
    FOREIGN KEY (staff_id)      REFERENCES staff(id),
    CONSTRAINT uq_attendance UNIQUE (student_id, subject_id, date, period_number)
);

-- 8. CIA MARKS
CREATE TABLE cia_marks (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    subject_id      BIGINT NOT NULL,
    semester        TINYINT NOT NULL,
    cia_number      TINYINT NOT NULL,
    marks_obtained  INT NOT NULL DEFAULT 0,
    max_marks       INT NOT NULL DEFAULT 50,
    entered_by      BIGINT NOT NULL,
    entered_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)    REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id)    REFERENCES subjects(id),
    CONSTRAINT uq_cia UNIQUE (student_id, subject_id, semester, cia_number)
);

-- 9. SEMESTER MARKS
CREATE TABLE semester_marks (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id      BIGINT NOT NULL,
    subject_id      BIGINT NOT NULL,
    semester        TINYINT NOT NULL,
    marks_obtained  INT NOT NULL DEFAULT 0,
    max_marks       INT NOT NULL DEFAULT 100,
    grade           VARCHAR(5),
    result          VARCHAR(10) DEFAULT 'FAIL',
    entered_by      BIGINT NOT NULL,
    entered_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)    REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id)    REFERENCES subjects(id),
    CONSTRAINT uq_sem_marks UNIQUE (student_id, subject_id, semester)
);

-- 10. FEE CATEGORIES
CREATE TABLE fee_categories (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    semester        TINYINT,
    academic_year   VARCHAR(10) NOT NULL,
    due_date        DATE
);

-- 11. FEE ALLOCATIONS
CREATE TABLE fee_allocations (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id        BIGINT NOT NULL,
    fee_category_id   BIGINT NOT NULL,
    amount_allocated  DECIMAL(10,2) NOT NULL,
    academic_year     VARCHAR(10) NOT NULL,
    allocated_by      BIGINT,
    allocated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id)     REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_category_id) REFERENCES fee_categories(id),
    CONSTRAINT uq_fee_alloc UNIQUE (student_id, fee_category_id, academic_year)
);

-- 12. FEE PAYMENTS (matches FeePayment.java entity: allocation_id FK)
CREATE TABLE fee_payments (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    allocation_id   BIGINT NOT NULL,
    amount_paid     DECIMAL(10,2) NOT NULL,
    payment_date    DATE NOT NULL,
    receipt_no      VARCHAR(50) NOT NULL UNIQUE,
    payment_mode    VARCHAR(10) DEFAULT 'CASH',
    transaction_id  VARCHAR(100),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (allocation_id) REFERENCES fee_allocations(id)
);

-- 13. STAFF ALLOCATIONS
CREATE TABLE staff_allocations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_id        BIGINT NOT NULL,
    subject_id      BIGINT NOT NULL,
    academic_year   VARCHAR(10) NOT NULL,
    FOREIGN KEY (staff_id)   REFERENCES staff(id),
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

-- ============================================================
-- SEED DATA (departments only; admin user is created by DataLoader.java)
-- ============================================================
INSERT INTO departments (name, code) VALUES
('Computer Science & Engineering', 'CSE'),
('Electronics & Communication Engineering', 'ECE'),
('Mechanical Engineering', 'MECH'),
('Civil Engineering', 'CIVIL');

-- INDEXES
CREATE INDEX idx_attendance_student   ON attendance(student_id, date);
CREATE INDEX idx_cia_student_subject  ON cia_marks(student_id, subject_id, semester);
CREATE INDEX idx_sem_student_subject  ON semester_marks(student_id, subject_id, semester);
CREATE INDEX idx_fee_student          ON fee_payments(allocation_id);
CREATE INDEX idx_timetable            ON class_periods(department_id, semester, day_of_week);
