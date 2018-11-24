'use strict';
module.exports = (sequelize, DataTypes) => {
  const SemesterClass = sequelize.define('SemesterClass', {
    location: {
      type: DataTypes.STRING,
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
    tableName: 'semester_classes'
  });
  SemesterClass.associate = function(models) {
    SemesterClass.belongsTo(models.Semester, {foreignKey: 'semesterId', sourceKey: 'id'});
    SemesterClass.belongsTo(models.Class, {foreignKey: 'classId', sourceKey: 'id'});
    SemesterClass.hasMany(models.SemesterClassSchedule, {foreignKey: 'semesterClassId', sourceKey: 'id'});
  };
  return SemesterClass;
};