'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstname: {
      type: DataTypes.STRING,
      validate: {} 
    },
    lastname: {
      type: DataTypes.STRING,
      validate: {} 
    },
    email: {
      type: DataTypes.STRING,
      validate: {} 
    },
    phone: {
      type: DataTypes.STRING,
      validate: {} 
    },
    birthdate: {
      type: DataTypes.DATE,
      validate: {} 
    },
    admin: {
      type: DataTypes.BOOLEAN,
      validate: {} 
    },
    password: {
      type: DataTypes.STRING,
      validate: {} 
    },
    emailVerifiedAt: {
      type: DataTypes.DATE,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'users'
  });
  User.associate = function(models) {
    User.hasMany(models.PaidBill, {foreignKey: 'paidByUserId', sourceKey: 'id'});
    User.belongsToMany(models.PaidBill, {as: 'BillsToPay', through: models.BillBorrowers, foreignKey: 'userId', otherKey: 'paidBillId'});
    User.belongsToMany(models.Task, {as: 'Tasks', through: models.TaskDates, foreignKey: 'userId', otherKey: 'taskId'});
    User.belongsToMany(models.Address, {as: 'Addresses', through: models.UserAddresses, foreignKey: 'userId', otherKey: 'addressId'});
    User.belongsToMany(models.App, {as: 'Apps', through: models.UserApps, foreignKey: 'userId', otherKey: 'appId'});
    User.belongsToMany(models.User, {as: 'Friends', through: models.UserFriends, foreignKey: 'userId', otherKey: 'friendId'});
    User.belongsToMany(models.Setting, {as: 'Settings', through: models.UserSettings, foreignKey: 'userId', otherKey: 'settingId'});
  };
  return User;
};