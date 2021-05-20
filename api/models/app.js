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
    visible: {
      type: DataTypes.BOOLEAN,
      validation: {
        isIn: [['true', 'false', '0', '1']]
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: false,
    freezeTableName: false,
    tableName: 'apps'
  });
  App.associate = (models) => {
    App.belongsToMany(models.User, {
      as: 'Users',
      through: models.UserApps,
      foreignKey: 'appId',
      otherKey: 'userId'
    });
    App.belongsTo(models.AppCategory, {
      foreignKey: 'categoryId',
      sourceKey: 'id'
    });
  };
  return App;
};