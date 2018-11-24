'use strict';
module.exports = (sequelize, DataTypes) => {
  const TaskSchedule = sequelize.define('TaskSchedule', {
    notes: {
      type: DataTypes.TEXT,
      validate: {} 
    },
    startDate: {
      type: DataTypes.DATE,
      validate: {} 
    },
    endDate: {
      type: DataTypes.DATE,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'task_schedules'
  });
  TaskSchedule.associate = function(models) {
    // associations can be defined here
  };
  return TaskSchedule;
};