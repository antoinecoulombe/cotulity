'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('apps', [
      {
        name: 'Calendar',
        description: 'Shows the calendar of your friends or flatmates so that you know when classes or events are coming up.',
        categoryId: 1,
        visible: true,
        image: 'fa-calendar-alt',
        createdAt: Sequelize.literal('NOW()'),
        updatedAt: Sequelize.literal('NOW()')
      },
      {
        name: 'Tasks',
        description: 'List of tasks you and your flatmates have to do.',
        categoryId: 1,
        visible: true,
        image: 'fa-tasks',
        createdAt: Sequelize.literal('NOW()'),
        updatedAt: Sequelize.literal('NOW()')
      },
      {
        name: 'Groceries',
        description: 'Missing groceries in your cohabitation.',
        categoryId: 1,
        visible: true,
        image: 'fa-utensils',
        createdAt: Sequelize.literal('NOW()'),
        updatedAt: Sequelize.literal('NOW()')
      },
      {
        name: 'Finances',
        description: 'Lists the your expenses and the ones of your flatmates and shows money owed or due between you.',
        categoryId: 1,
        visible: true,
        image: 'fa-file-invoice-dollar',
        createdAt: Sequelize.literal('NOW()'),
        updatedAt: Sequelize.literal('NOW()')
      },
      {
        name: 'Stocks',
        description: 'Tracks your investments and shows your earnings and losses statistics.',
        categoryId: 2,
        visible: false,
        image: 'fa-chart-line',
        createdAt: Sequelize.literal('NOW()'),
        updatedAt: Sequelize.literal('NOW()')
      },
      {
        name: 'Profile',
        description: 'Modify your personal and public information.',
        categoryId: 3,
        visible: true,
        image: 'fa-user-circle',
        createdAt: Sequelize.literal('NOW()'),
        updatedAt: Sequelize.literal('NOW()')
      },
      {
        name: 'Preferences',
        description: 'Set Cotulity the way you like it with those settings.',
        categoryId: 3,
        visible: true,
        image: 'fa-cogs',
        createdAt: Sequelize.literal('NOW()'),
        updatedAt: Sequelize.literal('NOW()')
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('apps', null, {});
  }
};
