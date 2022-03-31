'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserRecord extends Model {
    static associate(models) {
      UserRecord.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  UserRecord.init(
    {
      firstname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'UserRecords',
      sequelize,
    }
  );
  return UserRecord;
};
