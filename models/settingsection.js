'use strict';
module.exports = (sequelize, DataTypes) => {
  const SettingSection = sequelize.define('SettingSection', {
    id: DataTypes.INTEGER
  }, {});
  SettingSection.associate = function(models) {
    // associations can be defined here
  };
  return SettingSection;
};