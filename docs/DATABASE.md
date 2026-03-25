# Tài liệu Cơ sở dữ liệu - Hệ thống Quản lý và Đăng ký Học phần

Phiên bản: 1.0  
Ngày cập nhật: 23/03/2026  
Hệ quản trị cơ sở dữ liệu: MySQL 8.0+ / MariaDB 10.6+  
Bộ mã ký tự: utf8mb4 | Đối sánh: utf8mb4_unicode_ci

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Sơ đồ ERD](#2-sơ-đồ-erd)
3. [Chi tiết các bảng dữ liệu](#3-chi-tiết-các-bảng-dữ liệu)
4. [Quan hệ và Khóa ngoại](#4-quan-hệ-và-khóa-ngoại)
5. [Chỉ mục (Indexes)](#5-chỉ-mục-indexes)
6. [Quy tắc nghiệp vụ và Ràng buộc](#6-quy-tắc-nghiệp-vụ-và-ràng-buộc)
7. [Hướng dẫn triển khai di cư (Migration)](#7-hướng-dẫn-triển-khai-di-cư-migration)
8. [Dữ liệu mẫu khởi tạo](#8-dữ-liệu-mẫu-khởi-tạo)

---

## 1. Tổng quan

Hệ thống được thiết kế với 8 bảng chính trong cơ sở dữ liệu quan hệ:

| STT | Tên bảng | Mô tả | Số lượng cột |
|-----|----------|-------|---------------|
| 1 | students | Lưu trữ thông tin sinh viên và tài khoản người dùng | 10 |
| 2 | admins | Lưu trữ thông tin quản trị viên hệ thống | 9 |
| 3 | courses | Danh mục các môn học trong chương trình đào tạo | 7 |
| 4 | semesters | Thông tin về các học kỳ và thời gian đăng ký | 9 |
| 5 | sections | Các lớp học phần cụ thể được mở theo kỳ | 10 |
| 6 | schedules | Thời khóa biểu chi tiết cho từng lớp học phần | 7 |
| 7 | enrollments | Thông tin đăng ký học phần của sinh viên | 7 |
| 8 | results | Kết quả học tập và điểm số của sinh viên | 8 |

---

## 2. Sơ đồ ERD

```mermaid
erDiagram
    admins ||--o{ sections : "quản lý"
    students ||--o{ enrollments : "đăng ký"
    students ||--o{ results : "có kết quả"
    sections ||--o{ enrollments : "được đăng ký"
    sections ||--o{ schedules : "có lịch học"
    sections ||--o{ results : "có kết quả"
    courses ||--o{ sections : "mở lớp"
    courses ||--o{ results : "được tính điểm"
    semesters ||--o{ sections : "thuộc kỳ"
    semesters ||--o{ results : "thuộc kỳ"
    courses ||--o| courses : "tiên quyết"

    students {
        varchar(10) student_id PK
        varchar(100) full_name
        varchar(150) email UK
        varchar(255) password_hash
        date date_of_birth
        varchar(100) major
        int academic_year
        enum status
        datetime created_at
        datetime updated_at
    }

    admins {
        int admin_id PK
        varchar(100) full_name
        varchar(150) email UK
        varchar(255) password_hash
        varchar(50) role
        varchar(100) department
        enum status
        datetime created_at
        datetime updated_at
    }

    courses {
        varchar(10) course_id PK
        varchar(200) course_name
        tinyint credits
        varchar(100) department
        text description
        varchar(10) prerequisite_id FK
        boolean is_active
    }

    semesters {
        int semester_id PK
        varchar(50) semester_name
        varchar(9) academic_year
        tinyint semester_number
        date start_date
        date end_date
        datetime reg_open
        datetime reg_close
        boolean is_current
    }

    sections {
        int section_id PK
        varchar(20) section_code
        varchar(10) course_id FK
        int semester_id FK
        int admin_id FK
        varchar(100) lecturer_name
        smallint max_students
        smallint current_students
        varchar(20) room
        enum status
    }

    schedules {
        int schedule_id PK
        int section_id FK
        tinyint day_of_week
        tinyint start_period
        tinyint end_period
        varchar(20) room
        enum week_type
    }

    enrollments {
        int enrollment_id PK
        varchar(10) student_id FK
        int section_id FK
        datetime enrolled_at
        enum status
        datetime cancelled_at
        varchar(255) cancel_reason
    }

    results {
        int result_id PK
        varchar(10) student_id FK
        varchar(10) course_id FK
        int semester_id FK
        int section_id FK
        decimal midterm_score
        decimal final_score
        decimal total_score
        varchar(2) letter_grade
    }
```

---

## 3. Chi tiết các bảng dữ liệu

### 3.1 Bảng students - Thông tin sinh viên

Bảng này lưu trữ thông tin cá nhân và dữ liệu đăng nhập của sinh viên.

| Tên cột | Kiểu dữ liệu | Loại khóa | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|-----------|----------|----------|-------|
| student_id | VARCHAR(10) | Khóa chính | Có | - | Mã sinh viên |
| full_name | VARCHAR(100) | - | Có | - | Họ và tên đầy đủ |
| email | VARCHAR(150) | Duy nhất | Có | - | Địa chỉ email liên hệ |
| password_hash | VARCHAR(255) | - | Có | - | Mật khẩu đã được mã hóa theo Bcrypt |
| date_of_birth | DATE | - | Không | NULL | Ngày tháng năm sinh |
| major | VARCHAR(100) | - | Không | NULL | Chuyên ngành theo học |
| academic_year | INT | - | Không | NULL | Niên khóa nhập học |
| status | ENUM | - | Có | 'active' | Trạng thái: active, suspended, graduated |
| created_at | DATETIME | - | Có | CURRENT_TIMESTAMP | Thời điểm khởi tạo tài khoản |
| updated_at | DATETIME | - | Có | CURRENT_TIMESTAMP | Thời điểm cập nhật cuối cùng |

Ghi chú bảo mật: Mật khẩu được mã hóa sử dụng thuật toán Bcrypt với salt rounds là 10. Email được ràng buộc duy nhất trên toàn hệ thống.

---

### 3.4 Bảng admins - Quản trị viên hệ thống

Lưu trữ thông tin về các quản trị viên hệ thống có quyền quản lý các tài nguyên.

| Tên cột | Kiểu dữ liệu | Loại khóa | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|-----------|----------|----------|-------|
| admin_id | INT | Khóa chính | Có | Tự tăng | Mã định danh quản trị viên |
| full_name | VARCHAR(100) | - | Có | - | Họ và tên đầy đủ |
| email | VARCHAR(150) | Duy nhất | Có | - | Địa chỉ email liên hệ |
| password_hash | VARCHAR(255) | - | Có | - | Mật khẩu đã được mã hóa theo Bcrypt |
| role | VARCHAR(50) | - | Có | 'admin' | Vai trò: admin, manager, staff |
| department | VARCHAR(100) | - | Không | NULL | Khoa/Phòng quản lý |
| status | ENUM | - | Có | 'active' | Trạng thái: active, inactive, suspended |
| created_at | DATETIME | - | Có | CURRENT_TIMESTAMP | Thời điểm khởi tạo tài khoản |
| updated_at | DATETIME | - | Có | CURRENT_TIMESTAMP | Thời điểm cập nhật cuối cùng |

Ghi chú bảo mật: Mật khẩu được mã hóa sử dụng thuật toán Bcrypt với salt rounds là 10. Email được ràng buộc duy nhất trên toàn hệ thống.

---

### 3.5 Bảng courses - Danh mục môn học

Thông tin về các môn học hiện có trong hệ thống giảng dạy.

| Tên cột | Kiểu dữ liệu | Loại khóa | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|-----------|----------|----------|-------|
| course_id | VARCHAR(10) | Khóa chính | Có | - | Mã chính thức của môn học |
| course_name | VARCHAR(200) | - | Có | - | Tên gọi của môn học |
| credits | TINYINT | - | Có | - | Số đơn vị học trình (1-10) |
| department | VARCHAR(100) | - | Không | NULL | Khoa quản lý chuyên môn |
| description | TEXT | - | Không | NULL | Nội dung tóm tắt môn học |
| prerequisite_id | VARCHAR(10) | Khóa ngoại | Không | NULL | Mã môn học tiên quyết bắt buộc |
| is_active | BOOLEAN | - | Có | TRUE | Trạng thái hiển thị môn học |

Ghi chú: Cột prerequisite_id là khóa ngoại tự tham chiếu đến chính bảng courses.

---

### 3.6 Bảng semesters - Học kỳ

Quản lý thông tin thời gian theo từng giai đoạn học tập.

| Tên cột | Kiểu dữ liệu | Loại khóa | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|-----------|----------|----------|-------|
| semester_id | INT | Khóa chính | Có | Tự tăng | Mã định danh học kỳ |
| semester_name | VARCHAR(50) | - | Có | - | Tên học kỳ (VD: HK1 2024-2025) |
| academic_year | VARCHAR(9) | - | Có | - | Niên khóa (VD: 2024-2025) |
| semester_number | TINYINT | - | Có | - | Thứ tự kỳ: 1, 2 hoặc 3 (Hè) |
| start_date | DATE | - | Có | - | Ngày bắt đầu học kỳ |
| end_date | DATE | - | Có | - | Ngày kết thúc học kỳ |
| reg_open | DATETIME | - | Có | - | Thời điểm bắt đầu cho phép đăng ký |
| reg_close | DATETIME | - | Có | - | Thời điểm đóng hệ thống đăng ký |
| is_current | BOOLEAN | - | Có | FALSE | Đánh dấu học kỳ hiện tại |

Quy tắc: Hệ thống chỉ cho phép duy nhất một học kỳ có trạng thái is_current là TRUE tại mọi thời điểm.

---

### 3.7 Bảng sections - Lớp học phần

Các lớp học phần cụ thể được triển khai dựa trên danh mục môn học trong từng kỳ.

| Tên cột | Kiểu dữ liệu | Loại khóa | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|-----------|----------|----------|-------|
| section_id | INT | Khóa chính | Có | Tự tăng | Mã định danh lớp học phần |
| section_code | VARCHAR(20) | - | Có | - | Mã định danh lớp (VD: IT3001.01) |
| course_id | VARCHAR(10) | Khóa ngoại | Có | - | Tham chiếu đến bảng môn học |
| semester_id | INT | Khóa ngoại | Có | - | Tham chiếu đến bảng học kỳ |
| admin_id | INT | Khóa ngoại | Không | NULL | Quản trị viên quản lý lớp |
| lecturer_name | VARCHAR(100) | - | Không | NULL | Tên giảng viên phụ trách lớp |
| max_students | SMALLINT | - | Có | - | Giới hạn số lượng sinh viên tối đa |
| current_students | SMALLINT | - | Có | 0 | Số lượng sinh viên đã đăng ký thành công |
| room | VARCHAR(20) | - | Không | NULL | Địa điểm phòng học dự kiến |
| status | ENUM | - | Có | 'open' | Trạng thái: open, closed, cancelled |

---

### 3.8 Bảng schedules - Thời khóa biểu

Chi tiết về lịch học của từng buổi trong tuần cho mỗi lớp học phần.

| Tên cột | Kiểu dữ liệu | Loại khóa | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|-----------|----------|----------|-------|
| schedule_id | INT | Khóa chính | Có | Tự tăng | Mã định danh bản ghi lịch học |
| section_id | INT | Khóa ngoại | Có | - | Thuộc lớp học phần cụ thể |
| day_of_week | TINYINT | - | Có | - | Thứ mấy trong tuần (2 đến 8) |
| start_period | TINYINT | - | Có | - | Tiết học bắt đầu (1-12) |
| end_period | TINYINT | - | Có | - | Tiết học kết thúc (1-12) |
| room | VARCHAR(20) | - | Không | NULL | Phòng học cụ thể cho buổi đó |
| week_type | ENUM | - | Có | 'all' | Tần suất: all, odd (lẻ), even (chẵn) |

---

### 3.9 Bảng enrollments - Đăng ký học phần

Ghi nhận các yêu cầu đăng ký học phần chính thức của sinh viên.

| Tên cột | Kiểu dữ liệu | Loại khóa | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|-----------|----------|----------|-------|
| enrollment_id | INT | Khóa chính | Có | Tự tăng | Mã định danh lượt đăng ký |
| student_id | VARCHAR(10) | Khóa ngoại | Có | - | Mã sinh viên thực hiện đăng ký |
| section_id | INT | Khóa ngoại | Có | - | Mã lớp học phần được chọn |
| enrolled_at | DATETIME | - | Có | CURRENT_TIMESTAMP | Thời gian ghi nhận đăng ký |
| status | ENUM | - | Có | 'enrolled' | Trạng thái: enrolled, cancelled... |
| cancelled_at | DATETIME | - | Không | NULL | Thời điểm xác nhận hủy đăng ký |
| cancel_reason | VARCHAR(255) | - | Không | NULL | Lý do sinh viên thực hiện hủy |

Quy tắc: Cặp giá trị student_id và section_id được ràng buộc duy nhất nhằm tránh đăng ký lặp lại.

---

### 3.10 Bảng results - Kết quả học tập

Ghi nhận kết quả học tập, điểm số và xếp loại của sinh viên theo từng môn học.

| Tên cột | Kiểu dữ liệu | Loại khóa | Bắt buộc | Mặc định | Mô tả |
|---------|--------------|-----------|----------|----------|-------|
| result_id | INT | Khóa chính | Có | Tự tăng | Mã định danh kết quả |
| student_id | VARCHAR(10) | Khóa ngoại | Có | - | Mã sinh viên |
| course_id | VARCHAR(10) | Khóa ngoại | Có | - | Mã môn học |
| semester_id | INT | Khóa ngoại | Có | - | Mã học kỳ |
| section_id | INT | Khóa ngoại | Có | - | Mã lớp học phần |
| midterm_score | DECIMAL(5,2) | - | Không | NULL | Điểm giữa kỳ (0-10) |
| final_score | DECIMAL(5,2) | - | Không | NULL | Điểm cuối kỳ (0-10) |
| total_score | DECIMAL(5,2) | - | Không | NULL | Tổng điểm (0-10) |
| letter_grade | VARCHAR(2) | - | Không | NULL | Xếp loại: A, B+, B, C+, C, D+, D, F |

---

## 4. Quan hệ và Khóa ngoại

Bảng dưới đây liệt kê các tham chiếu giữa các thực thể:

| Bảng con | Cột nguồn | Bảng cha | Cột đích | Hành động khi xóa |
|----------|-----------|----------|----------|-------------------|
| courses | prerequisite_id | courses | course_id | SET NULL |
| sections | course_id | courses | course_id | RESTRICT |
| sections | semester_id | semesters | semester_id | RESTRICT |
| sections | admin_id | admins | admin_id | SET NULL |
| schedules | section_id | sections | section_id | CASCADE |
| enrollments | student_id | students | student_id | RESTRICT |
| enrollments | section_id | sections | section_id | RESTRICT |
| results | student_id | students | student_id | RESTRICT |
| results | course_id | courses | course_id | RESTRICT |
| results | semester_id | semesters | semester_id | RESTRICT |
| results | section_id | sections | section_id | RESTRICT |

---

## 5. Chỉ mục (Indexes)

Hệ thống sử dụng các chỉ mục sau để tối ưu hóa hiệu năng truy vấn:

- uq_students_email: Đảm bảo tính duy nhất của địa chỉ email.
- uq_admins_email: Đảm bảo tính duy nhất của địa chỉ email quản trị viên.
- idx_students_status: Tăng tốc độ lọc sinh viên theo tình trạng học tập.
- idx_admins_status: Tăng tốc độ lọc quản trị viên theo tình trạng hoạt động.
- idx_semesters_current: Truy xuất nhanh chóng thông tin học kỳ hiện hành.
- idx_sections_semester_course: Hỗ trợ tìm kiếm nhanh các lớp mở theo kỳ và môn.
- uq_enrollments_student_section: Ngăn chặn việc tạo ra các bản ghi đăng ký dư thừa.
- idx_results_student_course_semester: Tăng tốc độ truy xuất kết quả học tập theo sinh viên, môn học và kỳ.

---

## 6. Quy tắc nghiệp vụ và Ràng buộc

### 6.1 Quy trình kiểm tra khi đăng ký

1. Kiểm tra trạng thái sinh viên: Tài khoản phải ở trạng thái hoạt động (active), không được suspended hoặc graduated.
2. Kiểm tra trạng thái lớp: Lớp học phần phải còn chỗ trống (current_students < max_students) và đang ở trạng thái mở (open).
3. Kiểm tra thời gian: Yêu cầu phải được gởi đi trong khung giờ đăng ký của học kỳ tương ứng (giữa reg_open và reg_close).
4. Kiểm tra lịch học: Sinh viên không được phép đăng ký hai lớp có thời gian học bị chồng lấn nhau (xem chi tiết tại mục 6.2).
5. Kiểm tra trùng lặp: Sinh viên không thể đăng ký lại một lớp đã đăng ký thành công trước đó (ràng buộc UNIQUE trên student_id + section_id).

### 6.2 Xử lý xung đột lịch học

Hai lịch học được coi là trùng nhau (conflict) nếu:
- Diễn ra trong cùng một ngày thứ trong tuần (day_of_week bằng nhau).
- Có khoảng tiết học giao nhau (overlapping periods).
- Có tính chất tuần học tương thích:
  - "all" (tất cả tuần) trùng với bất kỳ week_type nào.
  - "odd" (tuần lẻ) trùng với "odd" hoặc "all".
  - "even" (tuần chẵn) trùng với "even" hoặc "all".

### 6.3 Quy tắc quản lý kết quả học tập

1. Điểm số được ghi nhận sau khi giảng viên nhập liệu.
2. Tổng điểm (total_score) được tính dựa trên công thức: 
   - total_score = (midterm_score × 0.4) + (final_score × 0.6)
3. Xếp loại chữ (letter_grade) được xác định dựa trên tổng điểm:
   - A: 8.5-10
   - B+: 8.0-8.4
   - B: 7.0-7.9
   - C+: 6.5-6.9
   - C: 6.0-6.4
   - D+: 5.5-5.9
   - D: 4.0-5.4
   - F: 0-3.9

---

## 7. Hướng dẫn triển khai di cư (Migration)

Các bước thiết lập cấu trúc cơ sở dữ liệu:

1. Đảm bảo dịch vụ MySQL đang hoạt động.
2. Tạo cơ sở dữ liệu rỗng với bộ mã utf8mb4.
3. Chạy file script SQL chính thức: migrations/init.sql.
4. Hoặc thực thi lệnh npm run migrate từ giao diện dòng lệnh của máy chủ.

---

## 8. Dữ liệu mẫu khởi tạo

Sau khi thiết lập cấu trúc, nên chạy lệnh npm run seed để tạo các dữ liệu cơ sở phục vụ mục đích kiểm thử phần mềm. Dữ liệu này bao gồm danh sách sinh viên mẫu, các môn học đa dạng, và các học kỳ với các khung giờ đăng ký khác nhau.
