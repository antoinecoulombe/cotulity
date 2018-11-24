'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserFriends = sequelize.define('UserFriends', {
    acceptedAt: {
      type: DataTypes.DATE,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'user_friends'
  });
  UserFriends.associate = function(models) {
    // associations can be defined here
  };
  return UserFriends;
};