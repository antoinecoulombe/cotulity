'use strict';
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notNull: true,
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    startDate: {
      type: DataTypes.DATE,
      validate: {
        notNull: true,
        notEmpty: true,
        isDate: true
      }
    },
    endDate: {
      type: DataTypes.DATE,
      validate: {
        isDate: true,
        isAfter: this.getDataValue('startDate')
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'tasks'
  });
  Task.associate = function (models) {
    Task.belongsToMany(models.User, {
      as: 'Users',
      through: models.TaskDates,
      foreignKey: 'taskId',
      otherKey: 'userId'
    });
  };
  return Task;
};