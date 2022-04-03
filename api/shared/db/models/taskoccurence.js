'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class TaskOccurence extends Model {
    static associate(models) {
      TaskOccurence.belongsTo(models.Task, {
        foreignKey: 'taskId',
        targetKey: 'id',
        as: 'Task',
        allowNull: false,
      });
      TaskOccurence.hasMany(models.TaskUser, {
        foreignKey: 'taskOccurenceId',
        as: 'userRelation',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      TaskOccurence.belongsToMany(models.User, {
        through: models.TaskUser,
        as: 'Users',
        foreignKey: 'taskOccurenceId',
        otherKey: 'userId',
      });
    }
  }
  TaskOccurence.init(
    {
      important: DataTypes.BOOLEAN,
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
