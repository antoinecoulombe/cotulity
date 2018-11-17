'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_tasks', {
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          table: 'users',
          field: 'id'
        }
      },
      taskId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          table: 'tasks',
          field: 'id'
        }
      },
      position: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      deletedAt: {
        type: Sequelize.DATE,
        defaultValue: null
      }
    }).then(() => queryInterface.addConstraint('fk_user_task', ['userId', 'taskId'], {
      type: 'primary key',
      name: 'userTask_pk'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_tasks');
  }
};
