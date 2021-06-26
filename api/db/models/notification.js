'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.Home, {
        foreignKey: 'typeId',
        targetKey: 'id',
        allowNull: false,
      });
      Notification.belongsTo(models.User, {
        foreignKey: 'toId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  Notification.init(
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
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
