"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("settings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      sectionId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: "setting_sections",
          key: "id",
        },
      },
      code: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      settingMethod: {
        // method called in node.js to apply setting.
        allowNull: false,
        type: Sequelize.STRING,
      },
      // Sentence to be shown in the settings page. (Explicative sentence
      // that the user can understand without looking at the description)
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description: {
        type: Sequelize.TEXT,
      },
      values: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "[true,false]",
      },
      defaultValue: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      type: {
        // radio/switch/checkbox/dropdown
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "switch",
      },
      visible: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    return queryInterface.dropTable("settings");
  },
};
