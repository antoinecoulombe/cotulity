'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Grocery extends Model {
    static associate(models) {
      Grocery.belongsTo(models.Home, {
        foreignKey: 'homeId',
        targetKey: 'id',
        allowNull: false,
      });
      Grocery.belongsTo(models.User, {
        foreignKey: 'ownerId',
        targetKey: 'id',
        as: 'Owner',
        allowNull: false,
      });
    }
  }
  Grocery.init(
    {
      purchateDate: DataTypes.DATE,
      description: {
        type: DataTypes.STRING,
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
      tableName: 'Groceries',
      sequelize,
    }
  );
  return Grocery;
};
