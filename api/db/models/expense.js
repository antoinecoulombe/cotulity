'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Expense extends Model {
    static associate(models) {
      Expense.belongsTo(models.User, {
        foreignKey: 'paidByUserId',
        targetKey: 'id',
        allowNull: false,
      });
      Expense.belongsTo(models.Home, {
        foreignKey: 'homeId',
        targetKey: 'id',
        allowNull: false,
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
      storeName: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'Please enter a store name.',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'Please enter a store name.',
          },
        },
      },
      date: DataTypes.DATE,
      totalAmount: {
        type: DataTypes.DECIMAL(19, 4),
        allowNull: {
          args: false,
          msg: 'Please enter an expense cost.',
        },
        validate: {
          isDecimal: {
            args: true,
            msg: 'Please enter a valid expense cost.',
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: {
          args: false,
          msg: 'Please enter a description.',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'Please enter a description.',
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
