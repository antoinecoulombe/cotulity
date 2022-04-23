'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'Groceries',
      [
        {
          homeId: 1,
          ownerId: 1,
          description: 'fajitas',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          homeId: 1,
          ownerId: 1,
          description: 'salsa',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          homeId: 1,
          ownerId: 1,
          description: 'oregano',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          homeId: 1,
          ownerId: 2,
          description: 'cheese',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          homeId: 1,
          ownerId: 2,
          description: 'tomatoes',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
          deletedAt: Sequelize.literal('NOW()'),
        },
        {
          homeId: 1,
          ownerId: 2,
          description: 'chicken',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          homeId: 2,
          ownerId: 1,
          description: 'salad',
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Groceries', null, {});
  },
};
