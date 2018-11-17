'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('user_addresses', {
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          table: 'users',
          field: 'id'
        }
      },
      addressId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          table: 'addresses',
          field: 'id'
        }
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
    }).then(() => queryInterface.addConstraint('fk_user_address', ['userId', 'address_id'], {
      type: 'primary key',
      name: 'userAddress_pk'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('user_addresses');
  }
};
