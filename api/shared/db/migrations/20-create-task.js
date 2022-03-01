'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      homeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Homes',
          key: 'id',
        },
      },
      ownerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      dueDateTime: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      important: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      shared: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      completedOn: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('Tasks');
  },
};
