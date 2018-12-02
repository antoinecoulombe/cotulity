'use strict';
module.exports = (sequelize, DataTypes) => {
  const PasswordReset = sequelize.define('PasswordReset', {
    email: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        allowNull: false,
        isEmail: true
      }
    },
    token: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        allowNull: false
      }
    },
    minutesBeforeExpiration: {
      type: DataTypes.INTEGER,
      validate: {
        notEmpty: true,
        allowNull: false,
        isNumeric: true
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'password_resets'
  });
  PasswordReset.associate = function (models) {
    // associations can be defined here
  };
  return PasswordReset;
};