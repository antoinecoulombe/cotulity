'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class App extends Model {
    static associate(models) {
      // define association here
    }
  }
  App.init(
    {
      priority: DataTypes.INTEGER,
      name: DataTypes.STRING,
      online: DataTypes.BOOLEAN,
      image: DataTypes.STRING,
      imageMultiplier: DataTypes.DECIMAL,
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'Apps',
      sequelize,
    }
  );
  return App;
};
