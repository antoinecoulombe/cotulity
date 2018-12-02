'use strict';
module.exports = (sequelize, DataTypes) => {
  const BillItem = sequelize.define('BillItem', {
    amount: {
      type: DataTypes.DECIMAL(19, 4),
      validate: {
        notEmpty: true,
        allowNull: false,
        isDecimal: true
      }
    },
    name: {
      type: DataTypes.STRING
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'bill_items'
  });
  BillItem.associate = function (models) {
    BillItem.belongsTo(models.PaidBill, {
      foreignKey: 'paidBillId',
      sourceKey: 'id'
    });
  };
  return BillItem;
};