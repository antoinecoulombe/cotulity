'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExpenseSplit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
