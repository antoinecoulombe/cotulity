"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "settings",
      [
        {
          name: "Dark mode",
          code: "DARK_MODE",
          sectionId: 1,
          settingMethod: "setDarkMode",
          description:
            "Converts all light colors, website wide, to dark colors.",
          values: "[true,false]",
          type: "switch",
          defaultValue: "false",
          createdAt: Sequelize.literal("NOW()"),
          updatedAt: Sequelize.literal("NOW()"),
        },
        {
          name: "Calendar tabs",
          code: "CALENDAR_PREFERRED_DISPLAY",
          sectionId: 2,
          settingMethod: "setCalendarPreferredDisplay",
          description:
            "Sets the default people to be shown when viewing the calendar page.",
          values: '["Roommates", "Friends"]',
          type: "checkbox",
          defaultValue: '["Roommates","Friends"]',
          createdAt: Sequelize.literal("NOW()"),
          updatedAt: Sequelize.literal("NOW()"),
        },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("settings", null, {});
  },
};
