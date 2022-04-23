'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Tasks',
      [
        {
          homeId: 2,
          ownerId: 2,
          name: 'Do dishes',
          shared: 1,
          repeat: 'none',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          homeId: 2,
          ownerId: 1,
          name: 'Clean',
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
    await queryInterface.bulkDelete('Tasks', null, {});
  },
};
