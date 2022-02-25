'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class NotificationType extends Model {
    static associate(models) {
      NotificationType.hasMany(models.Notification, {
        foreignKey: 'typeId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
    }
  }
  NotificationType.init(
    {
      name: DataTypes.STRING,
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
