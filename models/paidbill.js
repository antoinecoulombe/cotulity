'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bill = sequelize.define('PaidBill', {
    date: {
      type: DataTypes.DATE,
      validate: {} 
    },
    description: {
      type: DataTypes.TEXT,
      validate: {} 
    },
    totalAmount: {
      type: DataTypes.DECIMAL(19, 4),
      validate: {} 
    },
    taxesIncluded: {
      type: DataTypes.BOOLEAN,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'paid_bills'
  });
  Bill.associate = function(models) {
    Bill.belongsTo(models.User, {foreignKey: 'paidByUserId', sourceKey: 'id'});
    Bill.hasMany(models.BillItem, {foreignKey: 'paidBillId', sourceKey: 'id'});
    Bill.belongsToMany(models.User, {as: 'Borrowers', through: models.BillBorrowers, foreignKey: 'paidBillId', otherKey: 'userId'});
  };
  return Bill;
};