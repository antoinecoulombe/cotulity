'use strict';
module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    name: {
      type: DataTypes.STRING,
      validate: {} 
    },
    code: {
      type: DataTypes.STRING,
      validate: {} 
    },
    description: {
      type: DataTypes.TEXT,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'classes'
  });
  Class.associate = function(models) {
    // associations can be defined here
  };
  return Class;
};