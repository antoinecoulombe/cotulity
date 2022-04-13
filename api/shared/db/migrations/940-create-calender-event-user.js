'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('CalendarEventUsers', {
        userId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'Users',
            key: 'id',
          },
        },
        calendarEventOccurenceId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'CalendarEventOccurences',
            key: 'id',
          },
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
        },
        deletedAt: {
          type: Sequelize.DATE,
          defaultValue: null,
        },
      })
      .then(() =>
        queryInterface.addConstraint('CalendarEventUsers', {
          type: 'primary key',
          name: 'user_calendarevent_pk',
          fields: ['userId', 'calendarEventOccurenceId'],
        })
      );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CalendarEventUsers');
  },
};
