'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Apps',
      [
        {
          priority: 5,
          name: 'homes',
          online: true,
          image: 'home',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          priority: 10,
          name: 'calendar',
          online: true,
          image: 'calendar-days',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          priority: 15,
          name: 'tasks',
          online: true,
          image: 'tasks',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          priority: 20,
          name: 'groceries',
          online: true,
          image: 'utensils',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          priority: 25,
          name: 'accounts',
          online: true,
          image: 'file-invoice-dollar',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          priority: 90,
          name: 'console',
          online: false,
          image: 'terminal',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          priority: 95,
          name: 'profile',
          online: false,
          image: 'user-circle',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          priority: 100,
          name: 'settings',
          online: true,
          image: 'cogs',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Apps', null, {});
  },
};
