'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('HomeUsers', {
        userId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'Users',
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
        nickname: {
          type: Sequelize.STRING,
        },
        accepted: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false,
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
        queryInterface.addConstraint('HomeUsers', {
          type: 'primary key',
          name: 'user_home_pk',
          fields: ['userId', 'homeId'],
        })
      );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('HomeUsers');
  },
};
