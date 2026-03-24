-- ============================================================
-- Web Quản Lý & Đăng Ký Học Phần
-- Database: learning_system
-- Charset: utf8mb4 (hỗ trợ tiếng Việt đầy đủ)
-- ============================================================

CREATE DATABASE IF NOT EXISTS learning_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE learning_system;

-- ──────────────────────────────────────
-- 1. Bảng: students
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  student_id    VARCHAR(10)     NOT NULL,
  full_name     VARCHAR(100)    NOT NULL,
  email         VARCHAR(150)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  date_of_birth DATE            DEFAULT NULL,
  major         VARCHAR(100)    DEFAULT NULL,
  academic_year INT             DEFAULT NULL,
  status        ENUM('active', 'suspended', 'graduated') NOT NULL DEFAULT 'active',
  created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (student_id),
  UNIQUE KEY uq_students_email (email),

  INDEX idx_students_status (status),
  INDEX idx_students_major (major)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Thông tin sinh viên';


-- ──────────────────────────────────────
-- 2. Bảng: courses
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  course_id       VARCHAR(10)   NOT NULL,
  course_name     VARCHAR(200)  NOT NULL,
  credits         TINYINT       NOT NULL,
  department      VARCHAR(100)  DEFAULT NULL,
  description     TEXT          DEFAULT NULL,
  prerequisite_id VARCHAR(10)   DEFAULT NULL,
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,

  PRIMARY KEY (course_id),

  CONSTRAINT fk_courses_prerequisite
    FOREIGN KEY (prerequisite_id) REFERENCES courses(course_id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  CONSTRAINT chk_credits CHECK (credits BETWEEN 1 AND 10),

  INDEX idx_courses_department (department),
  INDEX idx_courses_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Danh mục môn học';


-- ──────────────────────────────────────
-- 3. Bảng: semesters
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS semesters (
  semester_id     INT AUTO_INCREMENT NOT NULL,
  semester_name   VARCHAR(50)        NOT NULL,
  academic_year   VARCHAR(9)         NOT NULL,
  semester_number TINYINT            NOT NULL,
  start_date      DATE               NOT NULL,
  end_date        DATE               NOT NULL,
  reg_open        DATETIME           NOT NULL,
  reg_close       DATETIME           NOT NULL,
  is_current      BOOLEAN            NOT NULL DEFAULT FALSE,

  PRIMARY KEY (semester_id),

  CONSTRAINT chk_semester_number CHECK (semester_number IN (1, 2, 3)),
  CONSTRAINT chk_semester_dates  CHECK (start_date < end_date),
  CONSTRAINT chk_reg_dates       CHECK (reg_open < reg_close),

  INDEX idx_semesters_current (is_current),
  INDEX idx_semesters_year (academic_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Quản lý học kỳ';


-- ──────────────────────────────────────
-- 4. Bảng: sections (Lớp học phần)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS sections (
  section_id       INT AUTO_INCREMENT NOT NULL,
  section_code     VARCHAR(20)        NOT NULL,
  course_id        VARCHAR(10)        NOT NULL,
  semester_id      INT                NOT NULL,
  lecturer_name    VARCHAR(100)       DEFAULT NULL,
  max_students     SMALLINT           NOT NULL,
  current_students SMALLINT           NOT NULL DEFAULT 0,
  room             VARCHAR(20)        DEFAULT NULL,
  status           ENUM('open', 'closed', 'cancelled') NOT NULL DEFAULT 'open',

  PRIMARY KEY (section_id),

  CONSTRAINT fk_sections_course
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_sections_semester
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT chk_max_students     CHECK (max_students >= 1),
  CONSTRAINT chk_current_students CHECK (current_students >= 0),

  INDEX idx_sections_course (course_id),
  INDEX idx_sections_semester (semester_id),
  INDEX idx_sections_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Lớp học phần';


-- ──────────────────────────────────────
-- 5. Bảng: schedules (Thời khóa biểu)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedules (
  schedule_id  INT AUTO_INCREMENT NOT NULL,
  section_id   INT                NOT NULL,
  day_of_week  TINYINT            NOT NULL,
  start_period TINYINT            NOT NULL,
  end_period   TINYINT            NOT NULL,
  room         VARCHAR(20)        DEFAULT NULL,
  week_type    ENUM('all', 'odd', 'even') NOT NULL DEFAULT 'all',

  PRIMARY KEY (schedule_id),

  CONSTRAINT fk_schedules_section
    FOREIGN KEY (section_id) REFERENCES sections(section_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT chk_day_of_week  CHECK (day_of_week BETWEEN 2 AND 8),
  CONSTRAINT chk_start_period CHECK (start_period BETWEEN 1 AND 12),
  CONSTRAINT chk_end_period   CHECK (end_period BETWEEN 1 AND 12),
  CONSTRAINT chk_period_range CHECK (start_period <= end_period),

  INDEX idx_schedules_section (section_id),
  INDEX idx_schedules_day (day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Thời khóa biểu';


-- ──────────────────────────────────────
-- 6. Bảng: enrollments (Đăng ký học phần)
-- 
CREATE TABLE IF NOT EXISTS enrollments (
  enrollment_id INT AUTO_INCREMENT NOT NULL,
  student_id    VARCHAR(10)        NOT NULL,
  section_id    INT                NOT NULL,
  enrolled_at   DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status        ENUM('enrolled', 'cancelled', 'completed') NOT NULL DEFAULT 'enrolled',
  cancelled_at  DATETIME           DEFAULT NULL,
  cancel_reason VARCHAR(255)       DEFAULT NULL,

  PRIMARY KEY (enrollment_id),

  CONSTRAINT fk_enrollments_student
    FOREIGN KEY (student_id) REFERENCES students(student_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  CONSTRAINT fk_enrollments_section
    FOREIGN KEY (section_id) REFERENCES sections(section_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  UNIQUE KEY uq_student_section (student_id, section_id),

  INDEX idx_enrollments_student (student_id),
  INDEX idx_enrollments_section (section_id),
  INDEX idx_enrollments_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Đăng ký học phần';
-- ──────────────────────────────────────
-- 7. Dữ liệu mẫu (Seed Data)
-- ──────────────────────────────────────

-- Thêm sinh viên mẫu
INSERT INTO students (student_id, full_name, email, password_hash, major, academic_year)
VALUES ('SV20210001', 'Nguyễn Văn A', 'nva.sv2021@university.edu.vn', '$2b$10$YourHashHere', 'Công nghệ Thông tin', 3);

-- Thêm học kỳ mẫu
INSERT INTO semesters (semester_name, academic_year, semester_number, start_date, end_date, reg_open, reg_close, is_current)
VALUES ('Học kỳ 1', '2026-2027', 1, '2026-09-01', '2027-01-15', '2026-08-01 08:00:00', '2026-08-20 23:59:59', TRUE);

-- Thêm danh mục môn học
INSERT INTO courses (course_id, course_name, credits, department)
VALUES 
('CS101', 'Nhập môn Lập trình', 3, 'Software Engineering'),
('CS201', 'Cấu trúc Dữ liệu và Giải thuật', 4, 'Computer Science'),
('MA101', 'Giải tích 1', 3, 'Mathematics'),
('SE301', 'Công nghệ Phần mềm', 4, 'Software Engineering'),
('SE302', 'Thực hành Công nghệ Phần mềm', 1, 'Software Engineering'),
('AI401', 'Trí tuệ Nhân tạo', 3, 'Computer Science');

-- Thêm quan hệ tiên quyết (ví dụ)
UPDATE courses SET prerequisite_id = 'CS101' WHERE course_name = 'Cấu trúc Dữ liệu và Giải thuật';
UPDATE courses SET prerequisite_id = 'CS201' WHERE course_name = 'Công nghệ Phần mềm';
UPDATE courses SET prerequisite_id = 'SE301' WHERE course_name = 'Thực hành Công nghệ Phần mềm';

-- Thêm lớp học phần cho học kỳ hiện tại (semester_id = 1)
INSERT INTO sections (section_code, course_id, semester_id, lecturer_name, max_students, current_students, room, status)
VALUES 
('CS101.01', 'CS101', 1, 'ThS. Lê Công C', 60, 60, 'A1.204', 'open'),
('CS201.01', 'CS201', 1, 'PGS. TS. Phạm Văn D', 50, 45, 'B2.301', 'open'),
('MA101.01', 'MA101', 1, 'ThS. Hoàng Văn E', 100, 80, 'C3.102', 'open'),
('SE301.01', 'SE301', 1, 'TS. Nguyễn Thị F', 40, 15, 'D1.205', 'open'),
('SE302.01', 'SE302', 1, 'TS. Nguyễn Thị F', 40, 15, 'PM3', 'open'),
('AI401.01', 'AI401', 1, 'GS. TS. Lê Văn G', 50, 25, 'A2.103', 'open');

-- Thêm thời khóa biểu cho các lớp học phần
-- day_of_week: 2 (Thứ 2), 3 (Thứ 3), ..., 8 (Chủ nhật)
INSERT INTO schedules (section_id, day_of_week, start_period, end_period, room)
VALUES 
(1, 2, 1, 3, 'A1.204'), -- CS101: Thứ 2, Tiết 1-3
(2, 3, 4, 6, 'B2.301'), -- CS201: Thứ 3, Tiết 4-6
(3, 4, 7, 9, 'C3.102'), -- MA101: Thứ 4, Tiết 7-9
(4, 5, 1, 4, 'D1.205'), -- SE301: Thứ 5, Tiết 1-4
(5, 6, 1, 3, 'PM3'),    -- SE302: Thứ 6, Tiết 1-3
(6, 3, 4, 6, 'A2.103'); -- AI401: Thứ 3, Tiết 4-6 (Trùng lịch với CS201 để test UI)

-- Thêm đăng ký mẫu cho sinh viên SV20210001
INSERT INTO enrollments (student_id, section_id, status)
VALUES 
('SV20210001', 2, 'enrolled'), -- CS201 (Thành công)
('SV20210001', 3, 'enrolled'); -- MA101 (Chờ xử lý - mô phỏng trong UI bằng status)
