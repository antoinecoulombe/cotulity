'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('password_resets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING
      },
      token: {
        allowNull: false,
        type: Sequelize.STRING
      },
      MinutesBeforeExpiration: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 15
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: queryInterface.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: queryInterface.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      },
      deletedAt: {
        type: Sequelize.DATE,
        defaultValue: null
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('password_resets');
  }
};