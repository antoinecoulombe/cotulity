'use strict';
module.exports = (sequelize, DataTypes) => {
  const AddressType = sequelize.define('AddressType', {
    id: DataTypes.INTEGER
  }, {});
  AddressType.associate = function(models) {
    AddressType.hasMany(models.Address, {foreignKey: 'addressTypeId', sourceKey: 'id'});
  };
  return AddressType;
};