'use strict';
module.exports = (sequelize, DataTypes) => {
  const SettingSection = sequelize.define('SettingSection', {
    name: {
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
    tableName: 'setting_sections'
  });
  SettingSection.associate = function (models) {
    SettingSection.hasMany(models.Setting, {
      foreignKey: 'sectionId',
      sourceKey: 'id'
    });
  };
  return SettingSection;
};