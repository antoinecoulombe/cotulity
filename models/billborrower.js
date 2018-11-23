'use strict';
module.exports = (sequelize, DataTypes) => {
  const BillBorrower = sequelize.define('BillBorrower', {
    id: DataTypes.INTEGER
  }, {});
  BillBorrower.associate = function(models) {
    // associations can be defined here
  };
  return BillBorrower;
};