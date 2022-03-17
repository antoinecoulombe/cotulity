'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PasswordReset extends Model {
    static associate(models) {
      PasswordReset.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  PasswordReset.init(
    {
      token: DataTypes.STRING,
      expirationDays: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: {
            args: true,
            msg: 'form.error.expirationDays.valid',
          },
          len: {
            args: [1, 14],
            msg: 'form.error.expirationDays.range',
          },
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'PasswordResets',
      sequelize,
    }
  );
  return PasswordReset;
};
