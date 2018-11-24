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
    // associations can be defined here
  };
  return Semester;
};