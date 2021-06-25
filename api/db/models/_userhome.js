'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserHome extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserHome.init(
    {
      nickname: DataTypes.STRING,
      accepted: DataTypes.BOOLEAN,
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'UserHomes',
      sequelize,
    }
  );
  return UserHome;
};
