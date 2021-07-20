'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class HomeInvitation extends Model {
    static associate(models) {
      HomeInvitation.belongsTo(models.Home, {
        foreignKey: 'homeId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  HomeInvitation.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'form.error.email.missing',
        },
        validate: {
          isEmail: {
            args: true,
            msg: 'form.error.email.valid',
          },
        },
      },
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
      tableName: 'HomeInvitations',
      sequelize,
    }
  );
  return HomeInvitation;
};
