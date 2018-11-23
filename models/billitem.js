'use strict';
module.exports = (sequelize, DataTypes) => {
  const BillItem = sequelize.define('BillItem', {
    id: DataTypes.INTEGER
  }, {});
  BillItem.associate = function(models) {
    // associations can be defined here
  };
  return BillItem;
};