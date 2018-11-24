'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    tableName: {
      type: DataTypes.STRING
    },
    tableRowId: {
      type: DataTypes.INTEGER
    },
    tableColumn: {
      type: DataTypes.STRING
    },
    tableColumnValue: {
      type: DataTypes.STRING
    },
    token: {
      type: DataTypes.STRING,
      validate: {
        notNull: true,
        notEmpty: true
      }
    },
    image: {
      type: DataTypes.STRING
    },
    message: {
      type: DataTypes.TEXT,
      validate: {
        notNul: true,
        notEmpty: true
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'notifications'
  });
  Notification.associate = function (models) {
    Notification.belongsTo(models.NotificationType, {
      foreignKey: 'typeId',
      sourceKey: 'id'
    });
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      sourceKey: 'id'
    });
  };
  return Notification;
};