'use strict';
module.exports = (sequelize, DataTypes) => {
  const School = sequelize.define('School', {
    name: {
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
    tableName: 'schools'
  });
  School.associate = function (models) {
    School.hasMany(models.Faculty, {
      foreignKey: 'schoolId',
      sourceKey: 'id'
    });
    School.belongsTo(models.Address, {
      foreignKey: 'addressId',
      sourceKey: 'id'
    });
  };
  return School;
};