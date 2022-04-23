'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'CalendarEventOccurences',
      [
        {
          calendarEventId: 1,
          location: 'Université de Sherbrooke',
          notes: 'Non-descriptive note.',
          start: Sequelize.literal('NOW()'),
          end: Sequelize.literal('NOW() + INTERVAL 2 hour'),
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
        {
          calendarEventId: 2,
          location: 'Université de Sherbrooke',
          start: Sequelize.literal('NOW() + INTERVAL 36 hour'),
          end: Sequelize.literal('NOW() + INTERVAL 40 hour'),
          createdAt: Sequelize.literal('NOW()'),
          updatedAt: Sequelize.literal('NOW()'),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('CalendarEventOccurences', null, {});
  },
};
