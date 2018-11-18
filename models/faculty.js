'use strict';
module.exports = (sequelize, DataTypes) => {
  const Faculty = sequelize.define('Faculty', {
    id: DataTypes.INTEGER
  }, {});
  Faculty.associate = function(models) {
    // associations can be defined here
  };
  return Faculty;
};