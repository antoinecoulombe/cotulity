"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    // Multiple groceries can be selected together to create a bill which will have a
    // bill-item for each grocery selected

    return queryInterface.createTable("groceries", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      createdByUserId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      notes: {
        type: Sequelize.TEXT,
      },
      soldAt: {
        type: Sequelize.STRING,
      },
      approximativeCost: {
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
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("groceries");
  },
};
