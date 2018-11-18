'use strict';
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: DataTypes.INTEGER
  }, {});
  Address.associate = function(models) {
    Address.belongsTo(models.AddressType, {foreignKey: 'addressTypeId', sourceKey: 'id'});
  };
  return Address;
};