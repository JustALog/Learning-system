-- ============================================================
-- Web Quản Lý & Đăng Ký Học Phần
-- Database: course_management
-- Charset: utf8mb4 (hỗ trợ tiếng Việt đầy đủ)
-- ============================================================

CREATE DATABASE IF NOT EXISTS course_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE course_management;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS schedules;
DROP TABLE IF EXISTS sections;
DROP TABLE IF EXISTS semesters;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
SET FOREIGN_KEY_CHECKS = 1;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ──────────────────────────────────────
-- 6. Bảng: enrollments (Đăng ký học phần)
-- ──────────────────────────────────────
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ──────────────────────────────────────
-- 7. Bảng: results (Kết quả học tập)
-- ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS results (
  result_id     INT AUTO_INCREMENT NOT NULL,
  student_id    VARCHAR(10)        NOT NULL,
  course_id     VARCHAR(10)        NOT NULL,
  semester_id   INT                NOT NULL,
  midterm_score DECIMAL(4, 2)      DEFAULT NULL ,
  final_score   DECIMAL(4, 2)      DEFAULT NULL ,
  total_score   DECIMAL(4, 2)      DEFAULT NULL ,
  grade_letter  VARCHAR(2)         DEFAULT NULL ,
  status        ENUM('pass', 'fail', 'studying') NOT NULL DEFAULT 'studying',
  created_at    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (result_id),
  
  CONSTRAINT fk_results_student
    FOREIGN KEY (student_id) REFERENCES students(student_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
    
  CONSTRAINT fk_results_course
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
    
  CONSTRAINT fk_results_semester
    FOREIGN KEY (semester_id) REFERENCES semesters(semester_id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
    
  UNIQUE KEY uq_student_course_semester (student_id, course_id, semester_id),

  INDEX idx_results_student (student_id),
  INDEX idx_results_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

