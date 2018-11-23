'use strict';
module.exports = (sequelize, DataTypes) => {
  const TaskSchedule = sequelize.define('TaskSchedule', {
    id: DataTypes.INTEGER
  }, {});
  TaskSchedule.associate = function(models) {
    // associations can be defined here
  };
  return TaskSchedule;
};