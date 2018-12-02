'use strict';
module.exports = (sequelize, DataTypes) => {
  const AddressType = sequelize.define('AddressType', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        allowNull: false
      }
    },
    image: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        allowNull: false,
        isUrl: true
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'address_types'
  });
  AddressType.associate = function (models) {
    AddressType.hasMany(models.Address, {
      foreignKey: 'addressTypeId',
      sourceKey: 'id'
    });
  };
  return AddressType;
};