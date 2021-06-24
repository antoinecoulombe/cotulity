'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('NotificationTypes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      icon: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      hexColor: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      showTime: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
        defaultValue: null,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('NotificationTypes');
  },
};
