'use strict';
module.exports = (sequelize, DataTypes) => {
  const Semester = sequelize.define('Semester', {
    name: {
      type: DataTypes.STRING
    },
    code: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        notNull: true
      }
    },
    notes: {
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
        isAfter: this.getDataValue('startDate')
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'semesters'
  });
  Semester.associate = function (models) {
    Semester.belongsTo(models.User, {
      foreignKey: 'userId',
      sourceKey: 'id'
    });
    Semester.hasMany(models.SemesterClass, {
      foreignKey: 'semesterId',
      sourceKey: 'id'
    });
    Semester.hasMany(models.SemesterVacation, {
      foreignKey: 'semesterId',
      sourceKey: 'id'
    });
  };
  return Semester;
};