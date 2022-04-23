'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'CalendarEvents',
      [
        {
          homeId: 1,
          ownerId: 1,
          name: 'IGL691',
          shared: 1,
          repeat: 'none',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          homeId: 1,
          ownerId: 2,
          name: 'IFT436',
          shared: 1,
          repeat: 'none',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('CalendarEvents', null, {});
  },
};
