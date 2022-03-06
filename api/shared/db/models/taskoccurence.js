'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TaskOccurence extends Model {
    static associate(models) {
      TaskOccurence.belongsTo(models.User, {
        foreignKey: 'taskId',
        targetKey: 'id',
        as: 'Task',
        allowNull: false,
      });
      TaskOccurence.hasMany(models.UserTask, {
        foreignKey: 'taskOccurenceId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      TaskOccurence.belongsToMany(models.User, {
        through: models.UserTask,
        as: 'Users',
        foreignKey: 'taskOccurenceId',
        otherKey: 'userId',
      });
    }
  }
  TaskOccurence.init(
    {
      dueDateTime: DataTypes.DATE,
      completedOn: DataTypes.DATE,
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'TaskOccurences',
      sequelize,
    }
  );
  return TaskOccurence;
};
