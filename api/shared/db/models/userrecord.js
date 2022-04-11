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
      UserRecord.hasMany(models.Expense, {
        foreignKey: 'paidByUserId',
        sourceId: 'id',
        onDelete: 'cascade',
        hooks: true,
      });
      UserRecord.hasMany(models.Transfer, {
        foreignKey: 'fromUserId',
        sourceId: 'id',
        as: 'TransferSent',
        onDelete: 'cascade',
        hooks: true,
      });
      UserRecord.hasMany(models.Transfer, {
        foreignKey: 'toUserId',
        sourceId: 'id',
        as: 'TransferReceived',
        onDelete: 'cascade',
        hooks: true,
      });
      UserRecord.hasMany(models.HomeDebt, {
        foreignKey: 'fromUserId',
        sourceId: 'id',
        as: 'fromDebt',
        hooks: true,
      });
      UserRecord.hasMany(models.HomeDebt, {
        foreignKey: 'toUserId',
        sourceId: 'id',
        as: 'toDebt',
        hooks: true,
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
