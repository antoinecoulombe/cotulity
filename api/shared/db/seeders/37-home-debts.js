'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'HomeDebts',
      [
        {
          fromUserId: 1,
          toUserId: 2,
          homeId: 1,
          amount: -2.125,
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('HomeDebts', null, {});
  },
};
