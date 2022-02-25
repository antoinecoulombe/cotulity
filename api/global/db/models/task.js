'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.belongsTo(models.User, {
        foreignKey: 'ownerId',
        targetKey: 'id',
        as: 'Owner',
        allowNull: false,
      });
      Task.belongsTo(models.Home, {
        foreignKey: 'homeId',
        targetKey: 'id',
        allowNull: false,
      });
      Task.hasMany(models.UserTask, {
        foreignKey: 'taskId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      Task.belongsToMany(models.User, {
        through: models.UserTask,
        as: 'Users',
        foreignKey: 'taskId',
        otherKey: 'userId',
      });
    }
  }
  Task.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'form.error.taskName.missing',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'form.error.taskName.missing',
          },
        },
      },
      dueDateTime: DataTypes.DATE,
      important: DataTypes.BOOLEAN,
      shared: DataTypes.BOOLEAN,
      completedOn: DataTypes.DATE,
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'Tasks',
      sequelize,
    }
  );
  return Task;
};
