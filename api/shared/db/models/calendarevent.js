'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CalendarEvent extends Model {
    static associate(models) {
      CalendarEvent.hasMany(models.CalendarEventOccurence, {
        foreignKey: 'calendarEventId',
        targetKey: 'id',
        as: 'Occurences',
        onDelete: 'cascade',
      });
      CalendarEvent.belongsTo(models.User, {
        foreignKey: 'ownerId',
        targetKey: 'id',
        as: 'Owner',
        allowNull: false,
      });
      CalendarEvent.belongsTo(models.Home, {
        foreignKey: 'homeId',
        targetKey: 'id',
        allowNull: false,
      });
    }
  }
  CalendarEvent.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: {
          args: false,
          msg: 'form.error.event.missing',
        },
        validate: {
          notEmpty: {
            args: true,
            msg: 'form.error.event.missing',
          },
        },
      },
      shared: DataTypes.BOOLEAN,
      repeat: DataTypes.STRING,
      untilDate: DataTypes.DATE,
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'CalendarEvents',
      sequelize,
    }
  );
  return CalendarEvent;
};
