'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('HomeDebts', {
        id: {
          primaryKey: false,
          autoIncrement: true,
          unique: true,
          type: Sequelize.INTEGER,
        },
        fromUserId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'UserRecords',
            key: 'id',
          },
        },
        toUserId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'UserRecords',
            key: 'id',
          },
        },
        homeId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'Homes',
            key: 'id',
          },
        },
        amount: {
          allowNull: false,
          type: Sequelize.DECIMAL(19, 4),
        },
      })
      .then(() =>
        queryInterface.addConstraint('HomeDebts', {
          type: 'primary key',
          name: 'home_debt_pk',
          fields: ['fromUserId', 'toUserId', 'homeId'],
        })
      );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('HomeDebts');
  },
};
