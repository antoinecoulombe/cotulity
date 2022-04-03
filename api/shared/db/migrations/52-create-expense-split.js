'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable('ExpenseSplits', {
        expenseId: {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'Expenses',
            key: 'id',
          },
        },
        userId: {
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
        queryInterface.addConstraint('ExpenseSplits', {
          type: 'primary key',
          name: 'user_expense_splits_pk',
          fields: ['userId', 'expenseId'],
        })
      );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('ExpenseSplits');
  },
};
