// This is a 'belongsToMany' link model, it should therefore most likely not have assocations.

'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserSettings = sequelize.define('UserSettings', {
    value: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'user_settings'
  });
  UserSettings.associate = function (models) {
    // associations can be defined here
  };
  return UserSettings;
};