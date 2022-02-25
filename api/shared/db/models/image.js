'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      // define association here
    }
  }
  Image.init(
    {
      filePath: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'Images',
      sequelize,
    }
  );
  return Image;
};
