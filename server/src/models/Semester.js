const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Semester = sequelize.define(
    'Semester',
    {
      semester_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID học kỳ tự tăng',
      },
      semester_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Tên học kỳ (VD: HK1 2024-2025)',
      },
      academic_year: {
        type: DataTypes.STRING(9),
        allowNull: false,
        comment: 'Năm học (VD: 2024-2025)',
      },
      semester_number: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          isIn: {
            args: [[1, 2, 3]],
            msg: 'Kỳ trong năm phải là 1, 2, hoặc 3 (hè)',
          },
        },
        comment: 'Kỳ trong năm: 1, 2, hoặc 3 (hè)',
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Ngày bắt đầu học kỳ',
      },
      end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Ngày kết thúc học kỳ',
      },
      reg_open: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Thời điểm mở đăng ký học phần',
      },
      reg_close: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Thời điểm đóng đăng ký học phần',
      },
      is_current: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Học kỳ hiện tại (chỉ 1 bản ghi = true)',
      },
    },
    {
      tableName: 'semesters',
      timestamps: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      validate: {
        startBeforeEnd() {
          if (this.start_date >= this.end_date) {
            throw new Error('start_date phải trước end_date');
          }
        },
        regOpenBeforeClose() {
          if (this.reg_open >= this.reg_close) {
            throw new Error('reg_open phải trước reg_close');
          }
        },
      },
    }
  );

  Semester.associate = (models) => {
    Semester.hasMany(models.Section, {
      foreignKey: 'semester_id',
      as: 'sections',
    });
  };

  return Semester;
};
