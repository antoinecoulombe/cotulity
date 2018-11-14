'use strict';
module.exports = (sequelize, DataTypes) => {
  const SemesterVacation = sequelize.define('SemesterVacation', {
    id: DataTypes.INTEGER
  }, {});
  SemesterVacation.associate = function(models) {
    // associations can be defined here
  };
  return SemesterVacation;
};