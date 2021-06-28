'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Home extends Model {
    static associate(models) {
      Home.belongsTo(models.User, {
        foreignKey: 'ownerId',
        targetKey: 'id',
        as: 'Owner',
        allowNull: false,
      });
      Home.hasMany(models.HomeInvitation, {
        foreignKey: 'homeId',
        sourceId: 'id',
      });
      Home.hasMany(models.Task, {
        foreignKey: 'homeId',
        sourceId: 'id',
      });
      Home.hasMany(models.Expense, {
        foreignKey: 'homeId',
        sourceId: 'id',
      });
      Home.hasMany(models.Transfer, {
        foreignKey: 'homeId',
        sourceId: 'id',
      });
      Home.hasMany(models.Grocery, {
        foreignKey: 'homeId',
        sourceId: 'id',
      });
      Home.belongsToMany(models.User, {
        through: models.UserHome,
        as: 'Members',
        foreignKey: 'homeId',
        otherKey: 'userId',
      });
    }
  }
  Home.init(
    {
      refNumber: DataTypes.STRING,
      name: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'Please enter a house name.',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'Please enter a house name.',
          },
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'Homes',
      sequelize,
    }
  );
  return Home;
};