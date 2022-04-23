'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Expenses',
      [
        {
          homeId: 1,
          paidByUserId: 1,
          description: 'Chicken',
          date: Sequelize.literal('NOW()'),
          totalAmount: 24.25,
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Expenses', null, {});
  },
};
