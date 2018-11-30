'use strict';
module.exports = (sequelize, DataTypes) => {
  const SemesterVacation = sequelize.define('SemesterVacation', {
    name: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        notNull: true
      }
    },
    description: {
      type: DataTypes.TEXT
    },
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
        // isAfter: this.getValueDate('startDate')
      }
    },
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'semester_vacations'
  });
  SemesterVacation.associate = function (models) {
    SemesterVacation.belongsTo(models.Semester, {
      foreignKey: 'semesterId',
      sourceKey: 'id'
    });
  };
  return SemesterVacation;
};