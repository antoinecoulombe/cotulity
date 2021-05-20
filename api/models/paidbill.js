'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bill = sequelize.define('PaidBill', {
    name: {
      type: DataTypes.STRING
    },
    date: {
      type: DataTypes.DATE,
      validate: {
        isDate: true
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    totalAmount: {
      type: DataTypes.DECIMAL(19, 4),
      validate: {
        isDecimal: true,
        isNumeric: true
      }
    },
    taxPercent: {
      type: DataTypes.DECIMAL(5, 3),
      allowNull: false,
      validate: {
        notEmpty: true,
        min: 0,
        max: 40
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'paid_bills'
  });
  Bill.associate = (models) => {
    Bill.belongsTo(models.User, {
      foreignKey: 'paidByUserId',
      sourceKey: 'id'
    });
    Bill.hasMany(models.BillItem, {
      foreignKey: 'paidBillId',
      sourceKey: 'id'
    });
    Bill.belongsToMany(models.User, {
      as: 'Borrowers',
      through: models.BillBorrowers,
      foreignKey: 'paidBillId',
      otherKey: 'userId'
    });
  };
  return Bill;
};