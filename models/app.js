'use strict';
module.exports = (sequelize, DataTypes) => {
  const App = sequelize.define('App', {
    id: DataTypes.INTEGER
  }, {});
  App.associate = function(models) {
    // associations can be defined here
  };
  return App;
};