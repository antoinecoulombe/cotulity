'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Apps',
      [
        {
          name: 'Homes',
          description: 'Manage your homes and join other homes.',
          online: true,
          image: 'fa-tasks',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          name: 'Tasks',
          description: 'Keep track of the tasks to do in your home.',
          online: true,
          image: 'fa-tasks',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          name: 'Groceries',
          description: "Note what's missing in your home here!",
          online: true,
          image: 'fa-utensils',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          name: 'Finance',
          description: "Manage your home's expenses.",
          online: true,
          image: 'fa-file-invoice-dollar',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          name: 'Settings',
          description: 'Set Cotulity the way you like it with those settings.',
          online: true,
          image: 'fa-cogs',
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
