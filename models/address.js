'use strict';
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    id: DataTypes.INTEGER
  }, {});
  Address.associate = function(models) {
    // associations can be defined here
  };
  return Address;
};