'use strict';
module.exports = (sequelize, DataTypes) => {
  const SemesterClass = sequelize.define('SemesterClass', {
    id: DataTypes.INTEGER
  }, {});
  SemesterClass.associate = function(models) {
    // associations can be defined here
  };
  return SemesterClass;
};