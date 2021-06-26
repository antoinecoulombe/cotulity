'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NotificationType extends Model {
    static associate(models) {
      NotificationType.hasMany(models.Notification, {
        foreignKey: 'typeId',
        sourceId: 'id',
      });
    }
  }
  NotificationType.init(
    {
      name: DataTypes.STRING,
      icon: DataTypes.STRING,
      hexColor: DataTypes.STRING,
      showTime: DataTypes.INTEGER,
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'NotificationTypes',
      sequelize,
    }
  );
  return NotificationType;
};
