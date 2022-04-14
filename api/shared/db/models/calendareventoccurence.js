'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CalendarEventOccurence extends Model {
    static associate(models) {
      CalendarEventOccurence.belongsTo(models.CalendarEvent, {
        foreignKey: 'calendarEventId',
        targetKey: 'id',
        as: 'CalendarEvent',
        allowNull: false,
      });
      CalendarEventOccurence.hasMany(models.CalendarEventUsers, {
        foreignKey: 'calendarEventOccurenceId',
        sourceId: 'id',
        as: 'userRelation',
        onDelete: 'cascade',
        hooks: true,
      });
      CalendarEventOccurence.belongsToMany(models.User, {
        through: models.CalendarEventUsers,
        as: 'Users',
        foreignKey: 'calendarEventOccurenceId',
        otherKey: 'userId',
      });
    }
  }
  CalendarEventOccurence.init(
    {
      location: DataTypes.STRING,
      notes: DataTypes.STRING,
      start: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      tableName: 'CalendarEventOccurences',
      sequelize,
    }
  );
  return CalendarEventOccurence;
};
