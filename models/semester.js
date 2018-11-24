'use strict';
module.exports = (sequelize, DataTypes) => {
  const Semester = sequelize.define('Semester', {
    name: {
      type: DataTypes.STRING,
      validate: {} 
    },
    code: {
      type: DataTypes.STRING,
      validate: {} 
    },
    notes: {
      type: DataTypes.TEXT,
      validate: {} 
    },
    startDate: {
      type: DataTypes.DATE,
      validate: {} 
    },
    endDate: {
      type: DataTypes.DATE,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'semesters'
  });
  Semester.associate = function(models) {
    Semester.belongsTo(models.User, {foreignKey: 'userId', sourceKey: 'id'});
    Semester.hasMany(models.SemesterClass, {foreignKey: 'semesterId', sourceKey: 'id'});
    Semester.hasMany(models.SemesterVacation, {foreignKey: 'semesterId', sourceKey: 'id'});
  };
  return Semester;
};