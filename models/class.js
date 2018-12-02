'use strict';
module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define('Class', {
    name: {
      type: DataTypes.STRING
    },
    code: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        allowNull: false
      }
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'classes'
  });
  Class.associate = function (models) {
    Class.belongsTo(models.Faculty, {
      foreignKey: 'facultyId',
      sourceKey: 'id'
    });
    Class.hasMany(models.SemesterClass, {
      foreignKey: 'classId',
      sourceKey: 'id'
    });
  };
  return Class;
};