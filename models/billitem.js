'use strict';
module.exports = (sequelize, DataTypes) => {
  const BillItem = sequelize.define('BillItem', {
    amount: {
      type: DataTypes.DECIMAL(19, 4),
      validate: {} 
    },
    name: {
      type: DataTypes.STRING,
      validate: {} 
    },
    description: {
      type: DataTypes.TEXT,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'bill_items'
  });
  BillItem.associate = function(models) {
    // associations can be defined here
  };
  return BillItem;
};