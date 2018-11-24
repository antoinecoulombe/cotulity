'use strict';
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: {
      type: DataTypes.STRING,
      validate: {} 
    },
    description: {
      type: DataTypes.TEXT,
      validate: {} 
    },
    startDate: {
      type: DataTypes.DATE,
      validate: {} 
    },
    endDate: {
      type: DataTypes.DATE,
      validate: {} 
    },
    tableName: {
      type: DataTypes.STRING,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'tasks'
  });
  Task.associate = function(models) {
    // associations can be defined here
  };
  return Task;
};