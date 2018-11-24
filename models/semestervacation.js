'use strict';
module.exports = (sequelize, DataTypes) => {
  const SemesterVacation = sequelize.define('SemesterVacation', {
    name: {
      type: DataTypes.STRING,
      validate: {} 
    },
    description: {
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
    },
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'semester_vacations'
  });
  SemesterVacation.associate = function(models) {
    SemesterVacation.belongsTo(models.Semester, {foreignKey: 'semesterId', sourceKey: 'id'});
  };
  return SemesterVacation;
};