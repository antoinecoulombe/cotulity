'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: DataTypes.INTEGER
  }, {});
  Notification.associate = function(models) {
    // associations can be defined here
  };
  return Notification;
};