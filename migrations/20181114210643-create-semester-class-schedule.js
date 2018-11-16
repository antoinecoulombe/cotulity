'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('semester_class_schedules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      semesterClassId: { // fk
        allowNull: false,
        type: Sequelize.INTEGER
      },
      startTime: {
        allowNull: false,
        type: Sequelize.TIME
      },
      endTime: {
        allowNull: false,
        type: Sequelize.TIME
      },
      weekDay: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      intervalDays: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      location: {
        type: Sequelize.STRING
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 'Class'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      deletedAt: {
        type: Sequelize.DATE,
        defaultValue: null
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('semester_class_schedules');
  }
};