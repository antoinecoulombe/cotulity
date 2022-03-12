'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserTask extends Model {
    static associate(models) {
      UserTask.belongsTo(models.TaskOccurence, {
        foreignKey: 'taskOccurenceId',
        targetKey: 'id',
        allowNull: false,
        hooks: true,
      });
      UserTask.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        allowNull: false,
      });
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
