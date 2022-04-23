'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Transfers',
      [
        {
          homeId: 1,
          fromUserId: 2,
          toUserId: 1,
          date: Sequelize.literal('NOW()'),
          amount: 10,
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Transfers', null, {});
  },
};
