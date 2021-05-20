'use strict';
module.exports = (sequelize, DataTypes) => {
  const NotificationType = sequelize.define('NotificationType', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    html: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'notification_types'
  });
  NotificationType.associate = (models) => {
    NotificationType.hasMany(models.Notification, {
      foreignKey: 'typeId',
      sourceKey: 'id'
    });
  };
  return NotificationType;
};