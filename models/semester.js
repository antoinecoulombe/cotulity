'use strict';
module.exports = (sequelize, DataTypes) => {
  const Semester = sequelize.define('Semester', {
    id: DataTypes.INTEGER
  }, {});
  Semester.associate = function(models) {
    // associations can be defined here
  };
  return Semester;
};