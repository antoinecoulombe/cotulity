// This is a 'belongsToMany' link model, it should therefore most likely not have assocations.

'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserAddresses = sequelize.define('UserAddresses', {
    acceptedAt: {
      type: DataTypes.DATE,
      validate: {
        isDate: true
      }
    },
    creator: {
      type: DataTypes.BOOLEAN,
      validate: {
        notEmpty: true,
        allowNull: false,
        isIn: [['true', 'false', '0', '1']]
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'user_addresses'
  });
  UserAddresses.associate = function (models) {
    // associations can be defined here
  };
  return UserAddresses;
};