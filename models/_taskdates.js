// This is a 'belongsToMany' link model, it should therefore most likely not have assocations.

'use strict';
module.exports = (sequelize, DataTypes) => {
  const TaskDate = sequelize.define('TaskDates', {
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
    },
    acceptedAt: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'task_dates'
  });
  TaskDate.associate = function(models) {
    // associations can be defined here
  };
  return TaskDate;
};