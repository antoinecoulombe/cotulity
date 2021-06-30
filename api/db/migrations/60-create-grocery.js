'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Groceries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      homeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Home',
          key: 'id',
        },
      },
      ownerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      purchaseDate: {
        // TODO: if not null: https://stackoverflow.com/questions/44253746/how-do-i-delete-rows-of-data-from-mysql-table-automatically-with-24-hours-after/44254400#44254400
        type: Sequelize.DATE,
      },
      description: {
        allowNull: false,
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Groceries');
  },
};
