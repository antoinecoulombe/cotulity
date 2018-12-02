// This is a 'belongsToMany' link model, it should therefore most likely not have assocations.

'use strict';
module.exports = (sequelize, DataTypes) => {
  const TaskDate = sequelize.define('TaskDates', {
    notes: {
      type: DataTypes.TEXT
    },
    startDate: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: true,
        allowNull: false,
        isDate: true
      }
    },
    endDate: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: true,
        allowNull: false,
        isDate: true,
        // isAfter: this.getDateValue('startDate')
      }
    },
    acceptedAt: {
      type: DataTypes.DATE,
      validate: {
        isDate: true
      }
    },
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'task_dates'
  });
  TaskDate.associate = function (models) {
    // associations can be defined here
  };
  return TaskDate;
};