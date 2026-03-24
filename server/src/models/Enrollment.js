const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Enrollment = sequelize.define(
    'Enrollment',
    {
      enrollment_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID bản ghi đăng ký',
      },
      student_id: {
        type: DataTypes.STRING(10),
        allowNull: false,
        references: {
          model: 'students',
          key: 'student_id',
        },
        comment: 'Sinh viên đăng ký',
      },
      section_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sections',
          key: 'section_id',
        },
        comment: 'Lớp học phần được đăng ký',
      },
      enrolled_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Thời điểm đăng ký thành công',
      },
      status: {
        type: DataTypes.ENUM('enrolled', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'enrolled',
        comment: 'Trạng thái đăng ký',
      },
      cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Thời điểm hủy (nếu có)',
      },
      cancel_reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Lý do hủy đăng ký',
      },
    },
    {
      tableName: 'enrollments',
      timestamps: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      indexes: [
        {
          unique: true,
          fields: ['student_id', 'section_id'],
          name: 'uq_student_section',
        },
      ],
    }
  );

  Enrollment.associate = (models) => {
    Enrollment.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'student',
      onDelete: 'RESTRICT',
    });

    Enrollment.belongsTo(models.Section, {
      foreignKey: 'section_id',
      as: 'section',
      onDelete: 'RESTRICT',
    });
  };

  return Enrollment;
};
