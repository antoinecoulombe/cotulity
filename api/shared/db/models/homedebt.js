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
      HomeDebt.belongsTo(models.User, {
        foreignKey: 'fromId',
        targetKey: 'id',
        as: 'From',
        allowNull: false,
      });
      HomeDebt.belongsTo(models.User, {
        foreignKey: 'toId',
        targetKey: 'id',
        as: 'To',
        allowNull: false,
      });
    }
  }
  HomeDebt.init(
    {
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
