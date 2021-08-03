'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Apps',
      [
        {
          name: 'homes',
          online: true,
          image: 'home',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          name: 'calendar',
          online: false,
          image: 'calendar-alt',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          name: 'tasks',
          online: true,
          image: 'tasks',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          name: 'groceries',
          online: true,
          image: 'utensils',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          name: 'finance',
          online: false,
          image: 'file-invoice-dollar',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
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
