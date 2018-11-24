'use strict';
module.exports = (sequelize, DataTypes) => {
  const PasswordReset = sequelize.define('PasswordReset', {
    email: {
      type: DataTypes.STRING,
      validate: {} 
    },
    token: {
      type: DataTypes.STRING,
      validate: {} 
    },
    minutesBeforeExpiration: {
      type: DataTypes.INTEGER,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'password_resets'
  });
  PasswordReset.associate = function(models) {
    // associations can be defined here
  };
  return PasswordReset;
};