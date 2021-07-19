'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserTask extends Model {
    static associate(models) {
      // define association here
    }
  }
  UserTask.init(
    {},
    {
      timestamps: true,
      paranoid: true,
      tableName: 'UserTasks',
      sequelize,
    }
  );
  return UserTask;
};
