'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TaskUser extends Model {
    static associate(models) {
      TaskUser.belongsTo(models.TaskOccurence, {
        foreignKey: 'taskOccurenceId',
        targetKey: 'id',
        allowNull: false,
        hooks: true,
      });
      TaskUser.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  TaskUser.init(
    {},
    {
      timestamps: true,
      paranoid: true,
      tableName: 'TaskUsers',
      sequelize,
    }
  );
  return TaskUser;
};
