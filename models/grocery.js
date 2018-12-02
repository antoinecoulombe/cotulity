'use strict';
module.exports = (sequelize, DataTypes) => {
  const Grocery = sequelize.define('Grocery', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validation: {
        notEmpty: true
      }
    },
    notes: {
      type: DataTypes.TEXT
    },
    soldAt: {
      type: DataTypes.STRING
    },
    approximativeCost: {
      type: DataTypes.DECIMAL(19, 4)
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'groceries'
  });
  Grocery.associate = function(models) {
    Grocery.belongsTo(models.User, {
      as: 'CreatedBy',
      foreignKey: 'createdByUserId',
      sourceKey: 'id'
    });
  };
  return Grocery;
};