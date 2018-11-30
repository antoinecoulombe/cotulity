'use strict';
module.exports = (sequelize, DataTypes) => {
  const SemesterClassSchedule = sequelize.define('SemesterClassSchedule', {
    startDate: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: true,
        notNull: true,
        isDate: true
      }
    },
    endDate: {
      type: DataTypes.DATE,
      validate: {
        notEmpty: true,
        notNull: true,
        isDate: true,
        // isAfter: this.getDataValue('startDate')
      }
    },
    location: {
      type: DataTypes.STRING
    },
    name: {
      type: DataTypes.STRING
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'semester_class_schedules'
  });
  SemesterClassSchedule.associate = function (models) {
    SemesterClassSchedule.belongsTo(models.SemesterClass, {
      foreignKey: 'semesterClassId',
      sourceKey: 'id'
    });
  };
  return SemesterClassSchedule;
};