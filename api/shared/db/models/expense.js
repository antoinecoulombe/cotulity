'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    static associate(models) {
      Expense.belongsTo(models.User, {
        foreignKey: 'paidByUserId',
        targetKey: 'id',
        as: 'PaidBy',
        allowNull: false,
      });
      Expense.belongsTo(models.Home, {
        foreignKey: 'homeId',
        targetKey: 'id',
        allowNull: false,
      });
      Expense.hasMany(models.ExpenseSplit, {
        foreignKey: 'expenseId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      Expense.belongsToMany(models.User, {
        through: models.ExpenseSplit,
        as: 'SplittedWith',
        foreignKey: 'expenseId',
        otherKey: 'userId',
      });
    }
  }
  Expense.init(
    {
      date: DataTypes.DATE,
      totalAmount: {
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
      description: {
        type: DataTypes.TEXT,
        allowNull: {
          args: false,
          msg: 'form.error.description.missing',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'form.error.description.missing',
          },
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'Expenses',
      sequelize,
    }
  );
  return Expense;
};
