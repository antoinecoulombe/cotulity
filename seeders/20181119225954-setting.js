'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('settings', [
      {
        name: 'Activate dark mode',
        code: 'DARK_MODE',
        sectionId: 1,
        settingMethod: 'setDarkMode',
        description: 'Converts all light colors, website wide, to dark colors.',
        type: 'boolean',
        createdAt: Sequelize.literal('NOW()'),
        updatedAt: Sequelize.literal('NOW()')
      },
      {
        name: 'Show this tab by default',
        code: 'CALENDAR_PREFERRED_DISPLAY',
        sectionId: 2,
        settingMethod: 'setCalendarPreferredDisplay',
        description: 'Sets the default people to be shown when viewing the calendar page.',
        values: '["Roommates", "Friends"]',
        type: 'checkbox',
        createdAt: Sequelize.literal('NOW()'),
        updatedAt: Sequelize.literal('NOW()')
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('settings', null, {});
  }
};
