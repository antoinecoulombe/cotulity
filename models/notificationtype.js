'use strict';
module.exports = (sequelize, DataTypes) => {
  const NotificationType = sequelize.define('NotificationType', {
    id: DataTypes.INTEGER
  }, {});
  NotificationType.associate = function(models) {
    // associations can be defined here
  };
  return NotificationType;
};