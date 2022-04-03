'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HomeUser extends Model {
    static associate(models) {
      HomeUser.belongsTo(models.Home, {
        foreignKey: 'homeId',
        targetKey: 'id',
        allowNull: false,
      });
      HomeUser.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  HomeUser.init(
    {
      nickname: DataTypes.STRING,
      accepted: DataTypes.BOOLEAN,
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'HomeUsers',
      sequelize,
    }
  );
  return HomeUser;
};
