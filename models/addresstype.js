'use strict';
module.exports = (sequelize, DataTypes) => {
  const AddressType = sequelize.define('AddressType', {
    id: DataTypes.INTEGER
  }, {});
  AddressType.associate = function(models) {
    // associations can be defined here
  };
  return AddressType;
};