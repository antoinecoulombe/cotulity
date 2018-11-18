'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserSetting = sequelize.define('UserSetting', {
    id: DataTypes.INTEGER
  }, {});
  UserSetting.associate = function(models) {
    // associations can be defined here
  };
  return UserSetting;
};