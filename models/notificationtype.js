'use strict';
module.exports = (sequelize, DataTypes) => {
  const NotificationType = sequelize.define('NotificationType', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        allowNull: false
      }
    },
    html: {
      type: DataTypes.TEXT,
      validate: {
        notEmpty: true,
        allowNull: false
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'notification_types'
  });
  NotificationType.associate = function (models) {
    NotificationType.hasMany(models.Notification, {
      foreignKey: 'typeId',
      sourceKey: 'id'
    });
  };
  return NotificationType;
};