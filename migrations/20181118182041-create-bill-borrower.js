'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('bill_borrowers', {
      paidBillId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'paid_bills',
          key: 'id'
        }
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      toPay: {
        allowNull: false,
        type: Sequelize.DECIMAL(19, 4)
      },
      paidAmount: {
        allowNull: false,
        type: Sequelize.DECIMAL(19, 4),
        defaultValue: 0
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
    }).then(() => queryInterface.addConstraint('bill_borrowers', ['userId', 'paidBillId'], {
      type: 'primary key',
      name: 'user_bill_pk'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('bill_borrowers');
  }
};