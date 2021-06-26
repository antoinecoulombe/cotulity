'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserHome extends Model {
    static associate(models) {
      // define association here
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
