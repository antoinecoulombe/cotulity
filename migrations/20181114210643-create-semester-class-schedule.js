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
      semesterClassId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          table: 'semester_classes',
          field: 'id'
        }
      },
      startDate: {
        allowNull: false,
        type: Sequelize.TIME
      },
      endDate: {
        allowNull: false,
        type: Sequelize.TIME
      },
      location: {
        type: Sequelize.STRING
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 'Class'
      },
      notes: {
        type: Sequelize.TEXT
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