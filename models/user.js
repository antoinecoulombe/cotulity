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
    // associations can be defined here
  };
  return User;
};