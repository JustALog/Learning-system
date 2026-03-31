const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Result = sequelize.define(
    'Result',
    {
      result_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID bản ghi kết quả',
      },
      student_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
          model: 'students',
          key: 'student_id',
        },
        comment: 'Mã sinh viên',
      },
      course_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
          model: 'courses',
          key: 'course_id',
        },
        comment: 'Mã môn học',
      },
      semester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'semesters',
          key: 'semester_id',
        },
        comment: 'ID học kỳ',
      },
      midterm_score: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        comment: 'Điểm giữa kỳ',
      },
      final_score: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        comment: 'Điểm cuối kỳ',
      },
      total_score: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: true,
        comment: 'Điểm tổng kết (hệ 10)',
      },
      grade_letter: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: 'Điểm chữ (A, B, C, D, F)',
      },
      status: {
        type: DataTypes.ENUM('pass', 'fail', 'studying'),
        defaultValue: 'studying',
        comment: 'Trạng thái (Đạt, Không đạt, Đang học)',
      },
    },
    {
      tableName: 'results',
      timestamps: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      indexes: [
        {
          unique: true,
          fields: ['student_id', 'course_id', 'semester_id'],
          name: 'uq_student_course_semester',
        },
      ],
    }
  );

  Result.associate = (models) => {
    Result.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'student',
    });
    Result.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course',
    });
    Result.belongsTo(models.Semester, {
      foreignKey: 'semester_id',
      as: 'semester',
    });
  };

  return Result;
};
