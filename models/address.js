const phoneFormatter = require('phone-formatter');
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    number: {
      type: DataTypes.INTEGER,
      validate: {
        isNumeric: true
      }
    },
    street: {
      type: DataTypes.STRING,
      validate: {}
    },
    city: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        allowNull: false
      }
    },
    zipcode: {
      type: DataTypes.STRING(30),
      validate: {},
      get() {
        return this.getDataValue('zipcode');
      },
      set(val) {
        this.setDataValue('zipcode', val.replace(/\s/g, '').toUpperCase());
      }
    },
    state: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        allowNull: false
      }
    },
    country: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        allowNull: false
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'addresses'
  });
  Address.associate = function (models) {
    Address.belongsTo(models.AddressType, {
      foreignKey: 'addressTypeId',
      sourceKey: 'id'
    });
    Address.hasMany(models.School, {
      foreignKey: 'addressId',
      sourceKey: 'id'
    });
    Address.belongsToMany(models.User, {
      as: 'Users',
      through: models.UserAddresses,
      foreignKey: 'addressId',
      otherKey: 'userId'
    });
  };
  return Address;
};