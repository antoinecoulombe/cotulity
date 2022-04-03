'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('TaskUsers', {
        userId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'Users',
            key: 'id',
          },
        },
        taskOccurenceId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'TaskOccurences',
            key: 'id',
          },
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
      })
      .then(() =>
        queryInterface.addConstraint('TaskUsers', {
          type: 'primary key',
          name: 'user_task_pk',
          fields: ['userId', 'taskOccurenceId'],
        })
      );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('TaskUsers');
  },
};
