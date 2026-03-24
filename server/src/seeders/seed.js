/**
 * Seed script - Creates sample data for FE integration testing.
 * Usage: npm run seed
 */
require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, Student, Course, Semester, Section, Schedule, Enrollment } = require('../models');

const SALT_ROUNDS = 10;

// Helper to get relative dates
const getDate = (daysOffset = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date;
};

const getIsoDate = (daysOffset = 0) => {
  return getDate(daysOffset).toISOString();
};

const getDateOnly = (daysOffset = 0) => {
  return getDate(daysOffset).toISOString().split('T')[0];
};

async function seedStudents(password) {
  console.log('--- Seeding Students ---');
  const students = await Student.bulkCreate([
    {
      student_id: '21IT001',
      full_name: 'Nguyễn Văn An',
      email: 'an.nguyen@student.edu.vn',
      password_hash: password,
      date_of_birth: '2003-05-15',
      major: 'Công nghệ thông tin',
      academic_year: 2021,
      status: 'active',
    },
    {
      student_id: '21IT002',
      full_name: 'Trần Thị Bình',
      email: 'binh.tran@student.edu.vn',
      password_hash: password,
      date_of_birth: '2003-08-22',
      major: 'Công nghệ thông tin',
      academic_year: 2021,
      status: 'active',
    },
    {
      student_id: '22CS001',
      full_name: 'Lê Hoàng Cường',
      email: 'cuong.le@student.edu.vn',
      password_hash: password,
      date_of_birth: '2004-01-10',
      major: 'Khoa học máy tính',
      academic_year: 2022,
      status: 'active',
    },
    {
      student_id: '22SE001',
      full_name: 'Hoàng Thị Em',
      email: 'em.hoang@student.edu.vn',
      password_hash: password,
      date_of_birth: '2004-03-08',
      major: 'Kỹ thuật phần mềm',
      academic_year: 2022,
      status: 'active',
    },
    {
      student_id: '20IT005',
      full_name: 'Phạm Minh Đức',
      email: 'duc.pham@student.edu.vn',
      password_hash: password,
      date_of_birth: '2002-11-30',
      major: 'Công nghệ thông tin',
      academic_year: 2020,
      status: 'graduated',
    },
  ]);
  console.log(`Seeded ${students.length} students`);
  return students;
}

async function seedCourses() {
  console.log('--- Seeding Courses ---');
  const courses = await Course.bulkCreate([
    {
      course_id: 'MATH101',
      course_name: 'Giải tích 1',
      credits: 4,
      department: 'Khoa Toán',
      description: 'Giới hạn, đạo hàm, tích phân và ứng dụng',
      is_active: true,
    },
    {
      course_id: 'MATH102',
      course_name: 'Đại số tuyến tính',
      credits: 3,
      department: 'Khoa Toán',
      description: 'Ma trận, vector, không gian vector, ánh xạ tuyến tính',
      is_active: true,
    },
    {
      course_id: 'IT1001',
      course_name: 'Nhập môn lập trình',
      credits: 3,
      department: 'Khoa CNTT',
      description: 'Cơ bản về lập trình C/C++',
      is_active: true,
    },
    {
      course_id: 'IT2001',
      course_name: 'Cấu trúc dữ liệu và giải thuật',
      credits: 4,
      department: 'Khoa CNTT',
      description: 'Stack, Queue, Tree, Graph, thuật toán sắp xếp, tìm kiếm',
      prerequisite_id: 'IT1001',
      is_active: true,
    },
    {
      course_id: 'IT3001',
      course_name: 'Cơ sở dữ liệu',
      credits: 3,
      department: 'Khoa CNTT',
      description: 'Mô hình quan hệ, SQL, thiết kế CSDL',
      prerequisite_id: 'IT1001',
      is_active: true,
    },
    {
      course_id: 'IT3002',
      course_name: 'Lập trình Web',
      credits: 3,
      department: 'Khoa CNTT',
      description: 'HTML, CSS, JavaScript, Node.js, React',
      prerequisite_id: 'IT2001',
      is_active: true,
    },
    {
      course_id: 'IT4001',
      course_name: 'Trí tuệ nhân tạo',
      credits: 3,
      department: 'Khoa CNTT',
      description: 'Tìm kiếm, logic, machine learning cơ bản',
      prerequisite_id: 'IT2001',
      is_active: true,
    },
  ]);
  console.log(`Seeded ${courses.length} courses`);
  return courses;
}

async function seedSemesters() {
  console.log('--- Seeding Semesters ---');
  const semesters = await Semester.bulkCreate([
    {
      semester_name: 'HK1 2024-2025',
      academic_year: '2024-2025',
      semester_number: 1,
      start_date: '2024-09-02',
      end_date: '2025-01-15',
      reg_open: '2024-08-15T08:00:00',
      reg_close: '2024-09-10T23:59:59',
      is_current: false,
    },
    {
      semester_name: 'HK2 2024-2025',
      academic_year: '2024-2025',
      semester_number: 2,
      start_date: getDateOnly(0),
      end_date: getDateOnly(120),
      // Registration window is OPEN NOW
      reg_open: getDateOnly(-30),
      reg_close: getDateOnly(30),
      is_current: true,
    },
    {
      semester_name: 'HK Hè 2024-2025',
      academic_year: '2024-2025',
      semester_number: 3,
      start_date: getDateOnly(130),
      end_date: getDateOnly(180),
      reg_open: getDateOnly(100),
      reg_close: getDateOnly(125),
      is_current: false,
    },
  ]);
  console.log(`Seeded ${semesters.length} semesters`);
  return semesters;
}

async function seedSections(semesterId) {
  console.log('--- Seeding Sections ---');
  const sections = await Section.bulkCreate([
    {
      section_code: 'MATH101.01',
      course_id: 'MATH101',
      semester_id: semesterId,
      lecturer_name: 'PGS.TS Nguyễn Văn Toán',
      max_students: 60,
      current_students: 0,
      room: 'A1-101',
      status: 'open',
    },
    {
      section_code: 'IT1001.01',
      course_id: 'IT1001',
      semester_id: semesterId,
      lecturer_name: 'ThS. Trần Minh Code',
      max_students: 45,
      current_students: 0,
      room: 'B2-301',
      status: 'open',
    },
    {
      section_code: 'IT2001.01',
      course_id: 'IT2001',
      semester_id: semesterId,
      lecturer_name: 'TS. Vũ Đức Algo',
      max_students: 50,
      current_students: 0,
      room: 'B1-201',
      status: 'open',
    },
    {
      section_code: 'IT3001.01',
      course_id: 'IT3001',
      semester_id: semesterId,
      lecturer_name: 'TS. Ngô Thị SQL',
      max_students: 40,
      current_students: 0,
      room: 'B1-302',
      status: 'open',
    },
    {
      section_code: 'IT3002.01',
      course_id: 'IT3002',
      semester_id: semesterId,
      lecturer_name: 'ThS. Đỗ React',
      max_students: 35,
      current_students: 0,
      room: 'B3-101',
      status: 'open',
    },
  ]);
  console.log(`Seeded ${sections.length} sections`);
  return sections;
}

async function seedSchedules(sections) {
  console.log('--- Seeding Schedules ---');
  const schedulesData = [
    // MATH101.01 - Mon 1-3, Wed 1-3
    { section_id: sections[0].section_id, day_of_week: 2, start_period: 1, end_period: 3, room: 'A1-101', week_type: 'all' },
    { section_id: sections[0].section_id, day_of_week: 4, start_period: 1, end_period: 3, room: 'A1-101', week_type: 'all' },
    // IT1001.01 - Mon 4-6, Fri 1-3
    { section_id: sections[1].section_id, day_of_week: 2, start_period: 4, end_period: 6, room: 'B2-301', week_type: 'all' },
    { section_id: sections[1].section_id, day_of_week: 6, start_period: 1, end_period: 3, room: 'B2-301', week_type: 'all' },
    // IT2001.01 - Tue 7-9, Thu 7-9
    { section_id: sections[2].section_id, day_of_week: 3, start_period: 7, end_period: 9, room: 'B1-201', week_type: 'all' },
    { section_id: sections[2].section_id, day_of_week: 5, start_period: 7, end_period: 9, room: 'B1-201', week_type: 'all' },
    // IT3001.01 - Wed 7-9
    { section_id: sections[3].section_id, day_of_week: 4, start_period: 7, end_period: 9, room: 'B1-302', week_type: 'all' },
    // IT3002.01 - Fri 4-6
    { section_id: sections[4].section_id, day_of_week: 6, start_period: 4, end_period: 6, room: 'B3-101', week_type: 'all' },
  ];
  const schedules = await Schedule.bulkCreate(schedulesData);
  console.log(`Seeded ${schedules.length} schedules`);
  return schedules;
}

async function seedEnrollments(students, sections) {
  console.log('--- Seeding Sample Enrollments ---');
  const studentAn = students.find(s => s.student_id === '21IT001');
  const sectionMath = sections.find(s => s.section_code === 'MATH101.01');
  const sectionIT1 = sections.find(s => s.section_code === 'IT1001.01');

  if (studentAn && sectionMath && sectionIT1) {
    await Enrollment.bulkCreate([
      { student_id: studentAn.student_id, section_id: sectionMath.section_id, enrolled_at: new Date(), status: 'enrolled' },
      { student_id: studentAn.student_id, section_id: sectionIT1.section_id, enrolled_at: new Date(), status: 'enrolled' },
    ]);
    
    // Increment counter
    await sectionMath.increment('current_students', { by: 1 });
    await sectionIT1.increment('current_students', { by: 1 });
    
    console.log(`Seeded sample enrollments for student ${studentAn.student_id}`);
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // WARNING: force: true drops and recreates tables
    await sequelize.sync({ force: true });
    console.log('Tables recreated from models');

    const password = await bcrypt.hash('123456', SALT_ROUNDS);
    
    const students = await seedStudents(password);
    await seedCourses();
    const semesters = await seedSemesters();
    
    const currentSemester = semesters.find(s => s.is_current);
    const sections = await seedSections(currentSemester.semester_id);
    await seedSchedules(sections);
    await seedEnrollments(students, sections);

    console.log('\n--- Seed Summary ---');
    console.log('Test Accounts (Password: 123456):');
    students.forEach(s => {
      console.log(` - [${s.student_id}] ${s.full_name} (${s.status})`);
    });
    console.log('\nHọc kỳ hiện tại:', currentSemester.semester_name);
    console.log('Thời gian đăng ký:', currentSemester.reg_open, 'đến', currentSemester.reg_close);

    console.log('\nAll seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\nSeeding failed:', error);
    process.exit(1);
  }
}

main();
