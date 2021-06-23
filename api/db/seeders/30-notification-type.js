'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'NotificationTypes',
      [
        {
          name: 'Success',
          icon: 'check-circle',
          hexColor: '#22a67a',
          showTime: 3,
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          name: 'Info',
          icon: 'info-circle',
          hexColor: '#007bc2',
          showTime: 5,
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          name: 'Warning',
          icon: 'exclamation-circle',
          hexColor: '#f0a92e',
          showTime: 5,
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          name: 'Error',
          icon: 'times-circle',
          hexColor: '#e83333',
          showTime: 10,
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('NotificationTypes', null, {});
  },
};
