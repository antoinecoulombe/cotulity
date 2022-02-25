'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.NotificationType, {
        as: 'type',
        foreignKey: 'typeId',
        targetKey: 'id',
        allowNull: false,
      });
      Notification.belongsTo(models.User, {
        as: 'to',
        foreignKey: 'toId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  Notification.init(
    {
      title: DataTypes.TEXT,
      description: DataTypes.TEXT,
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'Notifications',
      sequelize,
    }
  );
  return Notification;
};
