// This is a 'belongsToMany' link model, it should therefore most likely not have assocations.

'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserApps = sequelize.define('UserApps', {
    position: {
      type: DataTypes.INTEGER,
      validate: {
        isInt: true
      }
    },
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'user_apps'
  });
  UserApps.associate = (models) => {
    // associations can be defined here
  };
  return UserApps;
};