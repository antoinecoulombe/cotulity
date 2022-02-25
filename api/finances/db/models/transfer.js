'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Transfer extends Model {
    static associate(models) {
      Transfer.belongsTo(models.Home, {
        foreignKey: 'homeId',
        targetKey: 'id',
        allowNull: false,
      });
      Transfer.belongsTo(models.User, {
        foreignKey: 'fromId',
        targetKey: 'id',
        as: 'From',
        allowNull: false,
      });
      Transfer.belongsTo(models.User, {
        foreignKey: 'toId',
        targetKey: 'id',
        as: 'To',
        allowNull: false,
      });
    }
  }
  Transfer.init(
    {
      date: DataTypes.DATE,
      amount: {
        type: DataTypes.DECIMAL(19, 4),
        allowNull: {
          args: false,
          msg: 'form.error.transferAmount.missing',
        },
        validate: {
          isDecimal: {
            args: true,
            msg: 'form.error.transferAmount.valid',
          },
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'Transfers',
      sequelize,
    }
  );
  return Transfer;
};
