'use strict';
module.exports = (sequelize, DataTypes) => {
  const NotificationType = sequelize.define('NotificationType', {
    name: {
      type: DataTypes.STRING,
      validate: {} 
    },
    html: {
      type: DataTypes.TEXT,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'notification_types'
  });
  NotificationType.associate = function(models) {
    // associations can be defined here
  };
  return NotificationType;
};