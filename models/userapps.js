'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserApps = sequelize.define('UserApps', {
    
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'user_apps'
  });
  UserApps.associate = function(models) {
    // associations can be defined here
  };
  return UserApps;
};