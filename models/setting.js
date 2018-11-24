'use strict';
module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    code: {
      type: DataTypes.STRING,
      validate: {} 
    },
    settingMethod: {
      type: DataTypes.STRING,
      validate: {} 
    },
    name: {
      type: DataTypes.STRING,
      validate: {} 
    },
    description: {
      type: DataTypes.TEXT,
      validate: {} 
    },
    values: {
      type: DataTypes.STRING,
      validate: {} 
    },
    type: {
      type: DataTypes.STRING,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'settings'
  });
  Setting.associate = function(models) {
    // associations can be defined here
  };
  return Setting;
};