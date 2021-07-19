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
      token: DataTypes.STRING,
      expirationDays: {
        type: DataTypes.INTEGER,
        validate: {
          isInt: {
            args: true,
            msg: 'Please enter a valid expiration time.',
          },
          len: {
            args: [1, 14],
            msg: 'Please enter a value between 1 and 14 days.',
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
