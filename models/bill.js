'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bill = sequelize.define('Bill', {
    id: DataTypes.INTEGER
  }, {});
  Bill.associate = function(models) {
    // associations can be defined here
  };
  return Bill;
};