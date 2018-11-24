'use strict';
module.exports = (sequelize, DataTypes) => {
  const BillBorrower = sequelize.define('BillBorrower', {
    toPay: {
      type: DataTypes.DECIMAL(19, 4),
      validate: {} 
    },
    paidAmount: {
      type: DataTypes.DECIMAL(19, 4),
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'bill_borrowers'
  });
  BillBorrower.associate = function(models) {
    // associations can be defined here
  };
  return BillBorrower;
};