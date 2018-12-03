// This is a 'belongsToMany' link model, it should therefore most likely not have assocations.

'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserFriends = sequelize.define('UserFriends', {
    acceptedAt: {
      type: DataTypes.DATE,
      validate: {
        isDate: true
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'user_friends'
  });
  UserFriends.associate = (models) => {
    // associations can be defined here
  };
  return UserFriends;
};