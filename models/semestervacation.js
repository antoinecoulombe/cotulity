'use strict';
module.exports = (sequelize, DataTypes) => {
  const SemesterVacation = sequelize.define('SemesterVacation', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
        isDate: true
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notEmpty: true,
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
  SemesterVacation.associate = (models) => {
    SemesterVacation.belongsTo(models.Semester, {
      foreignKey: 'semesterId',
      sourceKey: 'id'
    });
  };
  return SemesterVacation;
};