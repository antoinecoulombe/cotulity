'use strict';
module.exports = (sequelize, DataTypes) => {
  const Faculty = sequelize.define('Faculty', {
    name: {
      type: DataTypes.STRING
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
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
    tableName: 'faculties'
  });
  Faculty.associate = (models) => {
    Faculty.hasMany(models.Faculty, {
      foreignKey: 'facultyId',
      sourceKey: 'id'
    });
    Faculty.belongsTo(models.School, {
      foreignKey: 'schoolId',
      sourceKey: 'id'
    });
  };
  return Faculty;
};