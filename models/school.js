'use strict';
module.exports = (sequelize, DataTypes) => {
  const School = sequelize.define('School', {
    name: {
      type: DataTypes.STRING,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'schools'
  });
  School.associate = function(models) {
    // associations can be defined here
  };
  return School;
};