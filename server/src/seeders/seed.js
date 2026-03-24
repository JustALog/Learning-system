/**
 * Seed script - Creates robust sample data for the Learning Management System.
 * Usage: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, Student, Course, Semester, Section, Schedule, Enrollment, Result } = require('../models');

const SALT_ROUNDS = 10;

// Helper to get relative dates
const getDateOnly = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

async function seedStudents(password) {
  console.log('--- Seeding Students ---');
  const students = await Student.bulkCreate([
    { student_id: '21IT001', full_name: 'Nguyễn Văn An', email: 'an.nguyen@student.edu.vn', password_hash: password, date_of_birth: '2003-05-15', major: 'Công nghệ thông tin', academic_year: 2021, status: 'active' },
    { student_id: '21IT002', full_name: 'Trần Thị Bình', email: 'binh.tran@student.edu.vn', password_hash: password, date_of_birth: '2003-08-22', major: 'Công nghệ thông tin', academic_year: 2021, status: 'active' },
    { student_id: '22CS001', full_name: 'Lê Hoàng Cường', email: 'cuong.le@student.edu.vn', password_hash: password, date_of_birth: '2004-01-10', major: 'Khoa học máy tính', academic_year: 2022, status: 'active' },
    { student_id: '22SE001', full_name: 'Hoàng Thị Em', email: 'em.hoang@student.edu.vn', password_hash: password, date_of_birth: '2004-03-08', major: 'Kỹ thuật phần mềm', academic_year: 2022, status: 'active' },
    { student_id: '20IT005', full_name: 'Phạm Minh Đức', email: 'duc.pham@student.edu.vn', password_hash: password, date_of_birth: '2002-11-30', major: 'Công nghệ thông tin', academic_year: 2020, status: 'graduated' },
    { student_id: '21BA001', full_name: 'Lý Tiểu Long', email: 'long.ly@student.edu.vn', password_hash: password, date_of_birth: '2003-02-14', major: 'Quản trị kinh doanh', academic_year: 2021, status: 'active' },
    { student_id: '21BA002', full_name: 'Võ Thị Sáu', email: 'sau.vo@student.edu.vn', password_hash: password, date_of_birth: '2003-06-19', major: 'Quản trị kinh doanh', academic_year: 2021, status: 'active' },
    { student_id: '22EE001', full_name: 'Nguyễn Điện Tử', email: 'tu.nguyen@student.edu.vn', password_hash: password, date_of_birth: '2004-09-05', major: 'Điện - Điện tử', academic_year: 2022, status: 'active' },
    { student_id: '23IT001', full_name: 'Trần Tân Binh', email: 'binh.tan@student.edu.vn', password_hash: password, date_of_birth: '2005-12-12', major: 'Công nghệ thông tin', academic_year: 2023, status: 'active' },
    { student_id: '21IT003', full_name: 'Đặng Đình Đốn', email: 'don.dang@student.edu.vn', password_hash: password, date_of_birth: '2003-04-01', major: 'Công nghệ thông tin', academic_year: 2021, status: 'suspended' },
  ]);
  console.log(`Seeded ${students.length} students`);
  return students;
}

async function seedCourses() {
  console.log('--- Seeding Courses ---');
  const courses = await Course.bulkCreate([
    // CNTT
    { course_id: 'IT1001', course_name: 'Nhập môn lập trình', credits: 3, department: 'Khoa CNTT', description: 'Cơ bản về lập trình C/C++', is_active: true },
    { course_id: 'IT2001', course_name: 'Cấu trúc dữ liệu và giải thuật', credits: 4, department: 'Khoa CNTT', description: 'Stack, Queue, Tree, Graph, thuật toán sắp xếp, tìm kiếm', prerequisite_id: 'IT1001', is_active: true },
    { course_id: 'IT3001', course_name: 'Cơ sở dữ liệu', credits: 3, department: 'Khoa CNTT', description: 'Mô hình quan hệ, SQL, thiết kế CSDL', prerequisite_id: 'IT1001', is_active: true },
    { course_id: 'IT3002', course_name: 'Lập trình Web', credits: 3, department: 'Khoa CNTT', description: 'HTML, CSS, JavaScript, Node.js, React', prerequisite_id: 'IT2001', is_active: true },
    { course_id: 'IT4001', course_name: 'Trí tuệ nhân tạo', credits: 3, department: 'Khoa CNTT', description: 'Tìm kiếm, logic, machine learning cơ bản', prerequisite_id: 'IT2001', is_active: true },
    { course_id: 'IT4002', course_name: 'An toàn thông tin', credits: 3, department: 'Khoa CNTT', description: 'Mã hóa, bảo mật mạng, tấn công và phòng thủ', prerequisite_id: 'IT2001', is_active: true },
    // Toán
    { course_id: 'MATH101', course_name: 'Giải tích 1', credits: 4, department: 'Khoa Toán', description: 'Giới hạn, đạo hàm, tích phân và ứng dụng', is_active: true },
    { course_id: 'MATH102', course_name: 'Đại số tuyến tính', credits: 3, department: 'Khoa Toán', description: 'Ma trận, vector, không gian vector, ánh xạ tuyến tính', is_active: true },
    { course_id: 'MATH201', course_name: 'Xác suất thống kê', credits: 3, department: 'Khoa Toán', description: 'Biến ngẫu nhiên, phân phối, kiểm định giả thuyết', prerequisite_id: 'MATH101', is_active: true },
    // Kinh tế
    { course_id: 'ECON101', course_name: 'Kinh tế học đại cương', credits: 3, department: 'Khoa Kinh tế', description: 'Cung cầu, thị trường, vĩ mô và vi mô cơ bản', is_active: true },
    { course_id: 'ECON201', course_name: 'Quản trị học', credits: 3, department: 'Khoa Kinh tế', description: 'Lập kế hoạch, tổ chức, lãnh đạo và kiểm soát', is_active: true },
    { course_id: 'ECON301', course_name: 'Marketing căn bản', credits: 3, department: 'Khoa Kinh tế', description: '4P, hành vi người tiêu dùng, nghiên cứu thị trường', is_active: true },
    // Kỹ thuật
    { course_id: 'ENG101', course_name: 'Vật lý đại cương 1', credits: 3, department: 'Khoa Kỹ thuật', description: 'Cơ học và nhiệt học', is_active: true },
    { course_id: 'ENG201', course_name: 'Mạch điện cơ bản', credits: 3, department: 'Khoa Kỹ thuật', description: 'Định luật Ohm, Kichhoff, mạch AC/DC', prerequisite_id: 'ENG101', is_active: true },
  ]);
  console.log(`Seeded ${courses.length} courses`);
  return courses;
}

async function seedSemesters() {
  console.log('--- Seeding Semesters ---');
  const semesters = await Semester.bulkCreate([
    { semester_name: 'HK1 2023-2024', academic_year: '2023-2024', semester_number: 1, start_date: '2023-09-01', end_date: '2024-01-15', reg_open: '2023-08-01T08:00:00', reg_close: '2023-08-20T23:59:59', is_current: false },
    { semester_name: 'HK2 2023-2024', academic_year: '2023-2024', semester_number: 2, start_date: '2024-02-15', end_date: '2024-06-30', reg_open: '2024-01-15T08:00:00', reg_close: '2024-02-05T23:59:59', is_current: false },
    { semester_name: 'HK1 2024-2025', academic_year: '2024-2025', semester_number: 1, start_date: '2024-09-02', end_date: '2025-01-15', reg_open: '2024-08-15T08:00:00', reg_close: '2024-09-10T23:59:59', is_current: false },
    { 
      semester_name: 'HK2 2024-2025', 
      academic_year: '2024-2025', 
      semester_number: 2, 
      start_date: getDateOnly(0), 
      end_date: getDateOnly(120),
      reg_open: getDateOnly(-30) + 'T08:00:00',
      reg_close: getDateOnly(30) + 'T23:59:59',
      is_current: true 
    },
  ]);
  console.log(`Seeded ${semesters.length} semesters`);
  return semesters;
}

async function seedSections(semesterId) {
  console.log('--- Seeding Sections ---');
  const sections = await Section.bulkCreate([
    { section_code: 'IT1001.01', course_id: 'IT1001', semester_id: semesterId, lecturer_name: 'ThS. Trần Minh Code', max_students: 45, current_students: 0, room: 'B2-301', status: 'open' },
    { section_code: 'IT2001.01', course_id: 'IT2001', semester_id: semesterId, lecturer_name: 'TS. Vũ Đức Algo', max_students: 50, current_students: 0, room: 'B1-201', status: 'open' },
    { section_code: 'IT3001.01', course_id: 'IT3001', semester_id: semesterId, lecturer_name: 'TS. Ngô Thị SQL', max_students: 40, current_students: 0, room: 'B1-302', status: 'open' },
    { section_code: 'IT3002.01', course_id: 'IT3002', semester_id: semesterId, lecturer_name: 'ThS. Đỗ React', max_students: 35, current_students: 0, room: 'B3-101', status: 'open' },
    { section_code: 'MATH101.01', course_id: 'MATH101', semester_id: semesterId, lecturer_name: 'PGS.TS Nguyễn Văn Toán', max_students: 60, current_students: 0, room: 'A1-101', status: 'open' },
    { section_code: 'MATH102.01', course_id: 'MATH102', semester_id: semesterId, lecturer_name: 'TS. Lê Đại Số', max_students: 50, current_students: 0, room: 'A1-102', status: 'open' },
    { section_code: 'ECON101.01', course_id: 'ECON101', semester_id: semesterId, lecturer_name: 'TS. Phạm Kinh Tế', max_students: 100, current_students: 0, room: 'C2-101', status: 'open' },
    { section_code: 'ECON201.01', course_id: 'ECON201', semester_id: semesterId, lecturer_name: 'ThS. Nguyễn Quản Trị', max_students: 40, current_students: 0, room: 'C2-201', status: 'open' },
    { section_code: 'ENG101.01', course_id: 'ENG101', semester_id: semesterId, lecturer_name: 'ThS. Bùi Vật Lý', max_students: 40, current_students: 0, room: 'D1-101', status: 'open' },
  ]);
  console.log(`Seeded ${sections.length} sections`);
  return sections;
}

async function seedSchedules(sections) {
  console.log('--- Seeding Schedules ---');
  const schedulesData = [
    // IT1001.01 - Mon 4-6, Fri 1-3
    { section_id: sections[0].section_id, day_of_week: 2, start_period: 4, end_period: 6, room: sections[0].room, week_type: 'all' },
    { section_id: sections[0].section_id, day_of_week: 6, start_period: 1, end_period: 3, room: sections[0].room, week_type: 'all' },
    // IT2001.01 - Tue 7-9, Thu 7-9
    { section_id: sections[1].section_id, day_of_week: 3, start_period: 7, end_period: 9, room: sections[1].room, week_type: 'all' },
    { section_id: sections[1].section_id, day_of_week: 5, start_period: 7, end_period: 9, room: sections[1].room, week_type: 'all' },
    // IT3001.01 - Wed 7-9
    { section_id: sections[2].section_id, day_of_week: 4, start_period: 7, end_period: 9, room: sections[2].room, week_type: 'all' },
    // IT3002.01 - Fri 4-6
    { section_id: sections[3].section_id, day_of_week: 6, start_period: 4, end_period: 6, room: sections[3].room, week_type: 'all' },
    // MATH101.01 - Mon 1-3, Wed 1-3
    { section_id: sections[4].section_id, day_of_week: 2, start_period: 1, end_period: 3, room: sections[4].room, week_type: 'all' },
    { section_id: sections[4].section_id, day_of_week: 4, start_period: 1, end_period: 3, room: sections[4].room, week_type: 'all' },
    // MATH102.01 - Tue 1-3
    { section_id: sections[5].section_id, day_of_week: 3, start_period: 1, end_period: 3, room: sections[5].room, week_type: 'all' },
    // ECON101.01 - Thu 1-3
    { section_id: sections[6].section_id, day_of_week: 5, start_period: 1, end_period: 3, room: sections[6].room, week_type: 'all' },
    // ECON201.01 - Sat 1-3
    { section_id: sections[7].section_id, day_of_week: 7, start_period: 1, end_period: 3, room: sections[7].room, week_type: 'all' },
    // ENG101.01 - Sat 4-6
    { section_id: sections[8].section_id, day_of_week: 7, start_period: 4, end_period: 6, room: sections[8].room, week_type: 'all' },
  ];
  const schedules = await Schedule.bulkCreate(schedulesData);
  console.log(`Seeded ${schedules.length} schedules`);
  return schedules;
}

async function seedEnrollments(students, sections) {
  console.log('--- Seeding Sample Enrollments ---');
  const studentAn = students.find(s => s.student_id === '21IT001');
  const studentBinh = students.find(s => s.student_id === '21IT002');
  
  const choices = [
    { s: studentAn, sections: [sections[0], sections[4], sections[6]] }, // IT1001, MATH101, ECON101
    { s: studentBinh, sections: [sections[1], sections[5], sections[7]] }, // IT2001, MATH102, ECON201
  ];

  for (const choice of choices) {
    if (choice.s) {
      for (const section of choice.sections) {
        if (section) {
          await Enrollment.create({ student_id: choice.s.student_id, section_id: section.section_id, enrolled_at: new Date(), status: 'enrolled' });
          await section.increment('current_students', { by: 1 });
        }
      }
      console.log(`Seeded enrollments for student ${choice.s.student_id}`);
    }
  }
}

async function seedResults(students, courses, semesters) {
  console.log('--- Seeding Results ---');
  const studentAn = students.find(s => s.student_id === '21IT001');
  const hk1_23 = semesters.find(s => s.semester_name === 'HK1 2023-2024');
  const hk2_23 = semesters.find(s => s.semester_name === 'HK2 2023-2024');
  const hk1_24 = semesters.find(s => s.semester_name === 'HK1 2024-2025');

  const resultData = [
    // HK1 23-24
    { student_id: studentAn.student_id, course_id: 'MATH101', semester_id: hk1_23.semester_id, midterm_score: 8.5, final_score: 9.0, total_score: 8.8, grade_letter: 'A', status: 'pass' },
    { student_id: studentAn.student_id, course_id: 'IT1001', semester_id: hk1_23.semester_id, midterm_score: 7.0, final_score: 8.5, total_score: 8.0, grade_letter: 'A', status: 'pass' },
    { student_id: studentAn.student_id, course_id: 'ENG101', semester_id: hk1_23.semester_id, midterm_score: 4.5, final_score: 3.5, total_score: 3.8, grade_letter: 'F', status: 'fail' },
    // HK2 23-24
    { student_id: studentAn.student_id, course_id: 'MATH102', semester_id: hk2_23.semester_id, midterm_score: 8.0, final_score: 7.5, total_score: 7.7, grade_letter: 'B', status: 'pass' },
    { student_id: studentAn.student_id, course_id: 'IT2001', semester_id: hk2_23.semester_id, midterm_score: 9.5, final_score: 9.0, total_score: 9.2, grade_letter: 'A', status: 'pass' },
    // HK1 24-25
    { student_id: studentAn.student_id, course_id: 'IT3001', semester_id: hk1_24.semester_id, midterm_score: 8.5, final_score: 8.0, total_score: 8.2, grade_letter: 'A', status: 'pass' },
    { student_id: studentAn.student_id, course_id: 'ECON101', semester_id: hk1_24.semester_id, midterm_score: 7.5, final_score: 7.0, total_score: 7.2, grade_letter: 'B', status: 'pass' },
  ];

  await Result.bulkCreate(resultData);
  console.log(`Seeded ${resultData.length} results for student ${studentAn.student_id}`);
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ force: true });
    console.log('Tables recreated from models');

    const password = await bcrypt.hash('123456', SALT_ROUNDS);
    
    const students = await seedStudents(password);
    const courses = await seedCourses();
    const semesters = await seedSemesters();
    
    const currentSemester = semesters.find(s => s.is_current);
    const sections = await seedSections(currentSemester.semester_id);
    await seedSchedules(sections);
    await seedEnrollments(students, sections);
    await seedResults(students, courses, semesters);

    console.log('\n--- Seed Summary ---');
    console.log('Test Accounts (Password: 123456):');
    students.slice(0, 5).forEach(s => console.log(` - [${s.student_id}] ${s.full_name} (${s.major})`));
    console.log('...');
    console.log(`\n- Students: ${students.length}`);
    console.log(`- Courses: ${courses.length}`);
    console.log(`- Semesters: ${semesters.length}`);
    console.log(`- Current Semester: ${currentSemester.semester_name}`);

    console.log('\nAll seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nSeeding failed:', error);
    process.exit(1);
  }
}

main();
