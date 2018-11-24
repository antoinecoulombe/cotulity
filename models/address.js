'use strict';
module.exports = (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    number: {
      type: DataTypes.INTEGER,
      validate: {}
    },
    street: {
      type: DataTypes.STRING,
      validate: {}
    },
    city: {
      type: DataTypes.STRING,
      validate: {} 
    },
    zipcode: {
      type: DataTypes.STRING(30),
      validate: {} 
    },
    state: {
      type: DataTypes.STRING,
      validate: {} 
    },
    country: {
      type: DataTypes.STRING,
      validate: {} 
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