'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class NotificationType extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
