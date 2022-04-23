'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'TaskOccurences',
      [
        {
          taskId: 1,
          important: 1,
          dueDateTime: Sequelize.literal('NOW()'),
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          taskId: 2,
          important: 0,
          dueDateTime: Sequelize.literal('NOW()'),
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TaskOccurences', null, {});
  },
};
