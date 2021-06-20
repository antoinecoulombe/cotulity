"use strict";
module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define(
    "Notification",
    {
      tableName: {
        type: DataTypes.STRING,
      },
      tableRowId: {
        type: DataTypes.INTEGER,
      },
      tableColumn: {
        type: DataTypes.STRING,
      },
      tableColumnValue: {
        type: DataTypes.STRING,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      image: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true,
        },
      },
      message: {
        type: DataTypes.TEXT,
        validate: {
          notEmpty: true,
          notNul: true,
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
      underscored: false,
      freezeTableName: false,
      tableName: "notifications",
    }
  );
  Notification.associate = (models) => {
    Notification.belongsTo(models.NotificationType, {
      foreignKey: "typeId",
      sourceKey: "id",
    });
    Notification.belongsTo(models.User, {
      foreignKey: "userId",
      sourceKey: "id",
    });
  };
  return Notification;
};
