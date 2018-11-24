'use strict';
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    tableName: {
      type: DataTypes.STRING,
      validate: {} 
    },
    tableRowId: {
      type: DataTypes.INTEGER,
      validate: {} 
    },
    tableColumn: {
      type: DataTypes.STRING,
      validate: {} 
    },
    tableColumnValue: {
      type: DataTypes.STRING,
      validate: {} 
    },
    token: {
      type: DataTypes.STRING,
      validate: {} 
    },
    image: {
      type: DataTypes.STRING,
      validate: {} 
    },
    message: {
      type: DataTypes.TEXT,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'notifications'
  });
  Notification.associate = function(models) {
    Notification.belongsTo(models.NotificationType, {foreignKey: 'typeId', sourceKey: 'id'});
    Notification.belongsTo(models.User, {foreignKey: 'userId', sourceKey: 'id'});
  };
  return Notification;
};