'use strict';
module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    id: DataTypes.INTEGER
  }, {});
  Class.associate = function(models) {
    // associations can be defined here
  };
  return Class;
};