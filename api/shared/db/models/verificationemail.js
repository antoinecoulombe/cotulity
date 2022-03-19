'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class VerificationEmail extends Model {
    static associate(models) {
      VerificationEmail.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  VerificationEmail.init(
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
            args: [1, 3],
            msg: 'form.error.expirationDays.range',
          },
        },
      },
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'VerificationEmails',
      sequelize,
    }
  );
  return VerificationEmail;
};
