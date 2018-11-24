// This is a 'belongsToMany' link model, it should therefore most likely not have assocations.

'use strict';
module.exports = (sequelize, DataTypes) => {
  const BillBorrower = sequelize.define('BillBorrowers', {
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