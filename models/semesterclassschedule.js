'use strict';
module.exports = (sequelize, DataTypes) => {
  const SemesterClassSchedule = sequelize.define('SemesterClassSchedule', {
    id: DataTypes.INTEGER
  }, {});
  SemesterClassSchedule.associate = function(models) {
    // associations can be defined here
  };
  return SemesterClassSchedule;
};