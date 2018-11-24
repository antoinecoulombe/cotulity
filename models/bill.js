'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bill = sequelize.define('Bill', {
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
    tableName: 'bills'
  });
  Bill.associate = function(models) {
    // associations can be defined here
  };
  return Bill;
};