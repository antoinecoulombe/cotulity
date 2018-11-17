'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_settings', {
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          table: 'users',
          field: 'id'
        }
      },
      settingId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          table: 'settings',
          field: 'id'
        }
      },
      value: {
        allowNull: false,
        type: Sequelize.STRING
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
    }).then(() => queryInterface.addConstraint('fk_user_setting', ['userId', 'settingId'], {
      type: 'primary key',
      name: 'userSetting_pk'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_settings');
  }
};