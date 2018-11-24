'use strict';
module.exports = (sequelize, DataTypes) => {
  const SemesterClassSchedule = sequelize.define('SemesterClassSchedule', {
    startDate: {
      type: DataTypes.DATE,
      validate: {} 
    },
    endDate: {
      type: DataTypes.DATE,
      validate: {} 
    },
    location: {
      type: DataTypes.STRING,
      validate: {} 
    },
    name: {
      type: DataTypes.STRING,
      validate: {} 
    },
    notes: {
      type: DataTypes.TEXT,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'semester_class_schedules'
  });
  SemesterClassSchedule.associate = function(models) {
    SemesterClassSchedule.belongsTo(models.SemesterClass, {foreignKey: 'semesterClassId', sourceKey: 'id'});
  };
  return SemesterClassSchedule;
};