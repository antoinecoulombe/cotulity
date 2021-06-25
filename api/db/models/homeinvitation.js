'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class HomeInvitation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
          msg: 'Please enter your email address.',
        },
        validate: {
          isEmail: {
            args: true,
            msg: 'Please enter a valid email address.',
          },
        },
      },
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
