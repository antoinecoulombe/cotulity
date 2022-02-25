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
      description: {
        type: DataTypes.STRING,
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
      tableName: 'Groceries',
      sequelize,
    }
  );
  return Grocery;
};
