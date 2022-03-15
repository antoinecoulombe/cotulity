'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('TaskOccurences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      taskId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Tasks',
          key: 'id',
        },
      },
      important: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      dueDateTime: {
        allowNull: false,
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('TaskOccurences');
  },
};
