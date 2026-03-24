const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Section = sequelize.define(
    'Section',
    {
      section_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID lớp học phần',
      },
      section_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Mã lớp (VD: IT3001.CNTT01)',
      },
      course_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
          model: 'courses',
          key: 'course_id',
        },
        comment: 'Thuộc môn học nào',
      },
      semester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'semesters',
          key: 'semester_id',
        },
        comment: 'Thuộc học kỳ nào',
      },
      lecturer_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Tên giảng viên',
      },
      max_students: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'Sĩ số tối đa phải >= 1' },
        },
        comment: 'Sĩ số tối đa (VD: 40, 60)',
      },
      current_students: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Số SV đã đăng ký',
      },
      room: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Phòng học (VD: B1-302)',
      },
      status: {
        type: DataTypes.ENUM('open', 'closed', 'cancelled'),
        allowNull: false,
        defaultValue: 'open',
        comment: 'Trạng thái lớp học phần',
      },
    },
    {
      tableName: 'sections',
      timestamps: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    }
  );

  Section.associate = (models) => {
    Section.belongsTo(models.Course, {
      foreignKey: 'course_id',
      as: 'course',
      onDelete: 'RESTRICT',
    });

    Section.belongsTo(models.Semester, {
      foreignKey: 'semester_id',
      as: 'semester',
      onDelete: 'RESTRICT',
    });

    Section.hasMany(models.Schedule, {
      foreignKey: 'section_id',
      as: 'schedules',
      onDelete: 'CASCADE',
    });

    Section.hasMany(models.Enrollment, {
      foreignKey: 'section_id',
      as: 'enrollments',
    });
  };

  return Section;
};
