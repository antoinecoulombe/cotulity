'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('UserTasks', {
        userId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'Users',
            key: 'id',
          },
        },
        taskId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'Tasks',
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
        queryInterface.addConstraint('UserTasks', {
          type: 'primary key',
          name: 'user_task_pk',
          fields: ['userId', 'taskId'],
        })
      );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserTasks');
  },
};
