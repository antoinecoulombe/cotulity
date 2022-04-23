'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'UserRecords',
      [
        {
          userId: 1,
          firstname: 'Vincent',
          lastname: 'Ducharme',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          userId: 2,
          firstname: 'Frederic',
          lastname: 'Bergeron',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('UserRecords', null, {});
  },
};
