'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserAddresses = sequelize.define('UserAddresses', {
    acceptedAt: {
      type: DataTypes.DATE,
      validate: {} 
    },
    creator: {
      type: DataTypes.BOOLEAN,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'user_addresses'
  });
  UserAddresses.associate = function(models) {
    // associations can be defined here
  };
  return UserAddresses;
};