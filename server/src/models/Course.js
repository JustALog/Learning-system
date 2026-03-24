const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Course = sequelize.define(
    'Course',
    {
      course_id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        comment: 'Mã môn học (VD: IT3001, MATH101)',
      },
      course_name: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: 'Tên môn học',
      },
      credits: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'Số tín chỉ tối thiểu là 1' },
          max: { args: [10], msg: 'Số tín chỉ tối đa là 10' },
        },
        comment: 'Số tín chỉ (1-10)',
      },
      department: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Khoa/Bộ môn quản lý',
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Mô tả môn học',
      },
      prerequisite_id: {
        type: DataTypes.STRING(10),
        allowNull: true,
        references: {
          model: 'courses',
          key: 'course_id',
        },
        comment: 'Môn học tiên quyết (tự tham chiếu)',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Môn đang mở (true/false)',
      },
    },
    {
      tableName: 'courses',
      timestamps: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    }
  );

  Course.associate = (models) => {
    // Self-referencing: prerequisite
    Course.belongsTo(models.Course, {
      foreignKey: 'prerequisite_id',
      as: 'prerequisite',
      onDelete: 'SET NULL',
    });

    Course.hasMany(models.Course, {
      foreignKey: 'prerequisite_id',
      as: 'dependentCourses',
    });

    Course.hasMany(models.Section, {
      foreignKey: 'course_id',
      as: 'sections',
    });
  };

  return Course;
};
