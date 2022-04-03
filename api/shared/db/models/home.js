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
        onDelete: 'cascade',
        hooks: true,
      });
      Home.hasMany(models.HomeDebt, {
        foreignKey: 'homeId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      Home.hasMany(models.Task, {
        foreignKey: 'homeId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      Home.hasMany(models.Expense, {
        foreignKey: 'homeId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      Home.hasMany(models.Transfer, {
        foreignKey: 'homeId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      Home.hasMany(models.Grocery, {
        foreignKey: 'homeId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      Home.hasMany(models.HomeUser, {
        foreignKey: 'homeId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      Home.belongsToMany(models.User, {
        through: models.HomeUser,
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
          msg: 'form.error.houseName.missing',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'form.error.houseName.missing',
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
