'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserHome extends Model {
    static associate(models) {
      UserHome.belongsTo(models.Home, {
        foreignKey: 'homeId',
        targetKey: 'id',
        allowNull: false,
      });
      UserHome.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  UserHome.init(
    {
      nickname: DataTypes.STRING,
      accepted: DataTypes.BOOLEAN,
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'UserHomes',
      sequelize,
    }
  );
  return UserHome;
};
