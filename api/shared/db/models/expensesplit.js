'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ExpenseSplit extends Model {
    static associate(models) {
      ExpenseSplit.belongsTo(models.Expense, {
        foreignKey: 'expenseId',
        targetKey: 'id',
        allowNull: false,
      });
      ExpenseSplit.belongsTo(models.UserRecord, {
        foreignKey: 'userId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  ExpenseSplit.init(
    {
      amount: {
        type: DataTypes.DECIMAL(19, 4),
        allowNull: {
          args: false,
          msg: 'form.error.amount.missing',
        },
        validate: {
          isDecimal: {
            args: true,
            msg: 'form.error.amount.valid',
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
