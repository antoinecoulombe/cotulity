'use strict';
module.exports = (sequelize, DataTypes) => {
  const AppCategory = sequelize.define('AppCategory', {
    name: {
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
    tableName: 'app_categories'
  });
  AppCategory.associate = function(models) {
    AppCategory.hasMany(models.App, {
      foreignKey: 'categoryId',
      sourceKey: 'id'
    });
  };
  return AppCategory;
};