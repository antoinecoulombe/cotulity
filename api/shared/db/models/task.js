'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    static associate(models) {
      Task.hasMany(models.TaskOccurence, {
        foreignKey: 'taskId',
        targetKey: 'id',
        as: 'Occurences',
        onDelete: 'cascade',
      });
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
      shared: DataTypes.BOOLEAN,
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
