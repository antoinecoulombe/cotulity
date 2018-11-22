'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('setting_sections', [
      {
        name: 'General',
        description: 'SETTING_DESCRIPTION'
      },
      {
        name: 'Calendar',
        description: 'SETTING_DESCRIPTION'
      }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('setting_sections', null, {});
  }
};
