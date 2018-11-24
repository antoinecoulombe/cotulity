'use strict';
module.exports = (sequelize, DataTypes) => {
  const Faculty = sequelize.define('Faculty', {
    name: {
      type: DataTypes.STRING,
      validate: {} 
    },
    code: {
      type: DataTypes.STRING,
      validate: {} 
    },
    description: {
      type: DataTypes.TEXT,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'faculties'
  });
  Faculty.associate = function(models) {
    Faculty.hasMany(models.Faculty, {foreignKey: 'facultyId', sourceKey: 'id'});
    Faculty.belongsTo(models.School, {foreignKey: 'schoolId', sourceKey: 'id'});
  };
  return Faculty;
};