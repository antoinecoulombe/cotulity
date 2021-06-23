"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("notifications", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      typeId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "notification_types",
          key: "id",
        },
      },
      userId: {
        // User which receives the notification
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "users",
          key: "id",
        },
      },
      tableName: {
        // Affected table's name
        type: Sequelize.STRING,
      },
      tableRowId: {
        // Affected table's row id
        type: Sequelize.INTEGER,
      },
      tableColumn: {
        // Affected table's column to modify
        type: Sequelize.STRING,
      },
      tableColumnValue: {
        // Value to affect to the specified column
        type: Sequelize.STRING,
      },
      token: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      image: {
        type: Sequelize.STRING,
      },
      message: {
        allowNull: false,
        type: Sequelize.TEXT,
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
    return queryInterface.dropTable("notifications");
  },
};
