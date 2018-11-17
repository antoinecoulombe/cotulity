'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_apps', {
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          table: 'users',
          field: 'id'
        }
      },
      appId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          table: 'apps',
          field: 'id'
        }
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
    }).then(() => queryInterface.addConstraint('fk_user_app', ['userId', 'appId'], {
      type: 'primary key',
      name: 'userApp_pk'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_apps');
  }
};
