'use strict';
import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class App extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  App.init(
    {
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      online: DataTypes.BOOLEAN,
      image: DataTypes.STRING,
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
