'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable('UserHomes', {
        userId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'user',
            key: 'id',
          },
        },
        HomeId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'home',
            key: 'id',
          },
        },
        nickname: {
          type: Sequelize.STRING,
        },
        isCreator: {
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
        queryInterface.addConstraint('user_addresses', ['userId', 'homeId'], {
          type: 'primary key',
          name: 'user_home_pk',
        })
      );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('UserHomes');
  },
};
