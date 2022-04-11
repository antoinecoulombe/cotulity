'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HomeDebt extends Model {
    static associate(models) {
      HomeDebt.belongsTo(models.Home, {
        foreignKey: 'homeId',
        targetKey: 'id',
        allowNull: false,
      });
      HomeDebt.belongsTo(models.UserRecord, {
        foreignKey: 'fromUserId',
        targetKey: 'id',
        as: 'From',
        allowNull: false,
      });
      HomeDebt.belongsTo(models.UserRecord, {
        foreignKey: 'toUserId',
        targetKey: 'id',
        as: 'To',
        allowNull: false,
      });
    }
  }
  HomeDebt.init(
    {
      id: { type: DataTypes.INTEGER },
      amount: {
        type: DataTypes.DECIMAL(19, 4),
        allowNull: {
          args: false,
          msg: 'form.error.expenseCost.missing',
        },
        validate: {
          isDecimal: {
            args: true,
            msg: 'form.error.expenseCost.valid',
          },
        },
      },
      homeId: { type: DataTypes.INTEGER, primaryKey: true },
      fromUserId: { type: DataTypes.INTEGER, primaryKey: true },
      toUserId: { type: DataTypes.INTEGER, primaryKey: true },
    },
    {
      timestamps: false,
      paranoid: false,
      tableName: 'HomeDebts',
      sequelize,
    }
  );
  return HomeDebt;
};
