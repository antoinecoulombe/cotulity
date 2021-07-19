'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ExpenseSplit extends Model {
    static associate(models) {
      // define association here
    }
  }
  ExpenseSplit.init(
    {
      amount: {
        type: DataTypes.DECIMAL(19, 4),
        allowNull: {
          args: false,
          msg: 'Please enter an amount.',
        },
        validate: {
          isDecimal: {
            args: true,
            msg: 'Please enter a valid amount.',
          },
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'ExpenseSplits',
      sequelize,
    }
  );
  return ExpenseSplit;
};
