const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Schedule = sequelize.define(
    'Schedule',
    {
      schedule_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'ID lịch học',
      },
      section_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'sections',
          key: 'section_id',
        },
        comment: 'Thuộc lớp học phần nào',
      },
      day_of_week: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: { args: [2], msg: 'day_of_week tối thiểu là 2 (Thứ Hai)' },
          max: { args: [8], msg: 'day_of_week tối đa là 8 (Chủ Nhật)' },
        },
        comment: 'Thứ trong tuần: 2-8 (CN=8)',
      },
      start_period: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'start_period tối thiểu là 1' },
          max: { args: [12], msg: 'start_period tối đa là 12' },
        },
        comment: 'Tiết bắt đầu (1-12)',
      },
      end_period: {
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
          min: { args: [1], msg: 'end_period tối thiểu là 1' },
          max: { args: [12], msg: 'end_period tối đa là 12' },
        },
        comment: 'Tiết kết thúc (1-12)',
      },
      room: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Phòng học (override section.room)',
      },
      week_type: {
        type: DataTypes.ENUM('all', 'odd', 'even'),
        allowNull: false,
        defaultValue: 'all',
        comment: 'all / odd / even (tuần chẵn/lẻ)',
      },
    },
    {
      tableName: 'schedules',
      timestamps: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      validate: {
        startBeforeEnd() {
          if (this.start_period > this.end_period) {
            throw new Error('start_period phải <= end_period');
          }
        },
      },
    }
  );

  Schedule.associate = (models) => {
    Schedule.belongsTo(models.Section, {
      foreignKey: 'section_id',
      as: 'section',
      onDelete: 'CASCADE',
    });
  };

  return Schedule;
};
