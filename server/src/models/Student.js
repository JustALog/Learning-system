const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Student = sequelize.define(
    'Student',
    {
      student_id: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
        comment: 'Mã sinh viên (VD: SV001, 21IT001)',
      },
      full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: 'Họ và tên đầy đủ',
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Email không hợp lệ' },
        },
        comment: 'Email đăng nhập - UNIQUE',
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Mật khẩu đã hash (bcrypt)',
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Ngày sinh',
      },
      major: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Ngành học (VD: Công nghệ thông tin)',
      },
      academic_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 2000,
          max: 2100,
        },
        comment: 'Năm nhập học (VD: 2021)',
      },
      status: {
        type: DataTypes.ENUM('active', 'suspended', 'graduated'),
        allowNull: false,
        defaultValue: 'active',
        comment: 'Trạng thái tài khoản',
      },
    },
    {
      tableName: 'students',
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    }
  );

  Student.associate = (models) => {
    Student.hasMany(models.Enrollment, {
      foreignKey: 'student_id',
      as: 'enrollments',
    });
  };

  return Student;
};
