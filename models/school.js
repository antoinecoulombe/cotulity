'use strict';
module.exports = (sequelize, DataTypes) => {
  const School = sequelize.define('School', {
    id: DataTypes.INTEGER
  }, {});
  School.associate = function(models) {
    // associations can be defined here
  };
  return School;
};