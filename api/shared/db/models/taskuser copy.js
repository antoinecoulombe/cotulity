'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CalendarEventUsers extends Model {
    static associate(models) {
      CalendarEventUsers.belongsTo(models.CalendarEventOccurence, {
        foreignKey: 'calendarEventOccurenceId',
        targetKey: 'id',
        allowNull: false,
        hooks: true,
      });
      CalendarEventUsers.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  CalendarEventUsers.init(
    {},
    {
      timestamps: true,
      paranoid: true,
      tableName: 'CalendarEventUsers',
      sequelize,
    }
  );
  return CalendarEventUsers;
};
