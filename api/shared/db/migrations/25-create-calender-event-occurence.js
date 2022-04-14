'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CalendarEventOccurences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      calendarEventId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'CalendarEvents',
          key: 'id',
        },
      },
      location: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      notes: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      start: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      end: {
        allowNull: false,
        type: Sequelize.DATE,
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CalendarEventOccurences');
  },
};
