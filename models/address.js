'use strict';
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: DataTypes.INTEGER,
    number: DataTypes.INTEGER,
    street: DataTypes.STRING,
    city: DataTypes.STRING,
    zipcode: DataTypes.STRING(30),
    state: DataTypes.STRING,
    country: DataTypes.STRING
  }, {});
  Address.associate = function(models) {
    Address.belongsTo(models.AddressType, {foreignKey: 'addressTypeId', sourceKey: 'id'});
  };
  return Address;
};