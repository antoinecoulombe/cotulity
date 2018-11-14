'use strict';
module.exports = (sequelize, DataTypes) => {
  const PasswordReset = sequelize.define('PasswordReset', {
    id: DataTypes.INTEGER
  }, {});
  PasswordReset.associate = function(models) {
    // associations can be defined here
  };
  return PasswordReset;
};