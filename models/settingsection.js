'use strict';
module.exports = (sequelize, DataTypes) => {
  const SettingSection = sequelize.define('SettingSection', {
    name: {
      type: DataTypes.STRING,
      validate: {} 
    },
    description: {
      type: DataTypes.TEXT,
      validate: {} 
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'setting_sections'
  });
  SettingSection.associate = function(models) {
    SettingSection.hasMany(models.Setting, {foreignKey: 'sectionId', sourceKey: 'id'});
  };
  return SettingSection;
};