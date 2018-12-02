'use strict';
module.exports = (sequelize, DataTypes) => {
  const App = sequelize.define('App', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: true
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'apps'
  });
  App.associate = function (models) {
    App.belongsToMany(models.User, {
      as: 'Users',
      through: models.UserApps,
      foreignKey: 'appId',
      otherKey: 'userId'
    });
  };
  return App;
};