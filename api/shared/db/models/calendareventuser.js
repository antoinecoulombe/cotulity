'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CalendarEventUser extends Model {
    static associate(models) {
      CalendarEventUser.belongsTo(models.CalendarEventOccurence, {
        foreignKey: 'calendarEventOccurenceId',
        targetKey: 'id',
        allowNull: false,
        hooks: true,
      });
      CalendarEventUser.belongsTo(models.User, {
        foreignKey: 'userId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  CalendarEventUser.init(
    {},
    {
      timestamps: true,
      paranoid: true,
      tableName: 'CalendarEventUsers',
      sequelize,
    }
  );
  return CalendarEventUser;
};
