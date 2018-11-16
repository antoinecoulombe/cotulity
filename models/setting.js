'use strict';
module.exports = (sequelize, DataTypes) => {
  const Setting = sequelize.define('Setting', {
    id: DataTypes.INTEGER
  }, {});
  Setting.associate = function(models) {
    // associations can be defined here
  };
  return Setting;
};