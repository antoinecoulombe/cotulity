'use strict';
module.exports = (sequelize, DataTypes) => {
  const SettingSection = sequelize.define('SettingSection', {
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
    tableName: 'setting_sections'
  });
  SettingSection.associate = (models) => {
    SettingSection.hasMany(models.Setting, {
      foreignKey: 'sectionId',
      sourceKey: 'id'
    });
  };
  return SettingSection;
};