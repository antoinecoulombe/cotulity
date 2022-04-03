'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('HomeDebts', {
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
          model: 'Homes',
          key: 'id',
        },
      },
      fromId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      toId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(19, 4),
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('HomeDebts');
  },
};
