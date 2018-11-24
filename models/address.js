const phoneFormatter = require('phone-formatter');
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    number: {
      type: DataTypes.INTEGER,
      validate: {
        isNumeric: true,
        isNotNull: false,
        len: [10, 15]
      },
      get() {
        return this.getDataValue('number');
      },
      set(val) {
        let regionnalCode = val.lenght() - 10;
        let n = "+";
        for (let i = 0; i < regionnalCode; ++i)
          n += "N";
        n += "(NNN) NNN-NNNN";
        this.setDataValue('number', phoneFormatter.format(val, n));
      },
    },
    street: {
      type: DataTypes.STRING,
      validate: {
        isNotNull: false
      }
    },
    city: {
      type: DataTypes.STRING,
      validate: {
        isNotNull: true,
        notEmpty: true
      }
    },
    zipcode: {
      type: DataTypes.STRING(30),
      validate: {
        isNotNull: false
      },
      get() {
        return this.getDataValue('zipcode');

      },
      set(val) {
        this.setDataValue('zipcode', val.toUpperCase());
      }
    },
    state: {
      type: DataTypes.STRING,
      validate: {
        isNotNull: true,
        notEmpty: true
      }
    },
    country: {
      type: DataTypes.STRING,
      validate: {
        isNotNull: true,
        notEmpty: true
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'addresses'
  });
  Address.associate = function(models) {
    Address.belongsTo(models.AddressType, {foreignKey: 'addressTypeId', sourceKey: 'id'});
    Address.hasMany(models.School, {foreignKey: 'addressId', sourceKey: 'id'});
    Address.belongsToMany(models.User, {as: 'Users', through: models.UserAddresses, foreignKey: 'addressId', otherKey: 'userId'});
  };
  return Address;
};