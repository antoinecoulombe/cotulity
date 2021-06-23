'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('UserHomes', {
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
      .then((queryInterface, Sequelize) =>
        queryInterface.addConstraint('UserHomes', ['userId', 'homeId'], {
          type: 'primary key',
          name: 'user_home_pk',
        })
      );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserHomes');
  },
};
