import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';
import { InputsToDate } from '../../../shared/src/routes/Global';
import { getHomeUsers } from '../../../shared/src/routes/Homes';

const Calendar = express.Router();
const db = require('../../../shared/db/models');
const { Op } = require('sequelize');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

/**
 * Verifies that the app is online.
 */
Calendar.use(async (req: any, res, next) => {
  req.params.appname = 'calendar';
  validateApp(req, res, next);
});

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

/**
 * Gets the event users.
 * @param req The HTTP request.
 * @param res The HTTP response.
 * @returns An array containing the event users.
 */
const getUsers = async (req: any, res: any) => {
  if (!req.body.event?.Users) return [];

  let members = await getHomeUsers(db, res);

  // Return all users in request intersecting with home members
  return members.filter(
    (m: any) =>
      req.body.event.Users.filter((u: any) => u.id === m.id).length > 0
  );
};

// ########################################################
// ######################### GET ##########################
// ########################################################

/**
 * Gets all house events.
 */
Calendar.get('/events', async (req: any, res: any) => {
  try {
    let events = await db.CalendarEventOccurence.findAll({
      attributes: ['id', 'location', 'notes', 'start', 'end'],
      include: [
        {
          model: db.CalendarEvent,
          as: 'Event',
          attributes: ['id', 'name', 'shared', 'repeat', 'untilDate'],
          where: { [Op.or]: [{ ownerId: req.user.id }, { shared: true }] },
          include: [
            {
              model: db.User,
              as: 'Owner',
              attributes: ['id', 'firstname', 'lastname'],
              include: [{ model: db.Image, attributes: ['url'] }],
            },
          ],
        },
        {
          model: db.User,
          as: 'Users',
          attributes: ['id', 'firstname', 'lastname'],
          include: [{ model: db.Image, attributes: ['url'] }],
        },
      ],
    });

    const getNDate = () => {
      let date = new Date();
      date.setHours(date.getHours() + 3);
      return date.toString();
    };

    return res.json({
      title: 'request.success',
      msg: 'request.success',
      events: [
        // events
        {
          id: -1,
          location: 'Nowhere',
          notes: 'No notes',
          start: new Date().toString(),
          end: getNDate(),
          duration: 180,
          Event: {
            id: -1,
            name: 'Event 1',
            shared: true,
            repeat: 'week',
            untilDate: getNDate(),
            Occurences: [],
          },
          Users: [
            {
              id: 1,
              firstname: 'Barake',
              lastname: 'Lacroix',
              Image: null,
            },
            {
              id: 2,
              firstname: 'Joe',
              lastname: 'Gilbert',
              Image: null,
            },
          ],
        },
      ],
      users: await getHomeUsers(db, res),
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

/**
 * Modifies a calendar event found in the associated house.
 */
Calendar.put('/events/:id', async (req: any, res: any) => {
  try {
    return res.json({
      title: 'calendar.event.modified',
      msg: 'calendar.event.modified',
      created: [],
      deleted: [],
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### POST #########################
// ########################################################

function dateDiffInDays(a: Date, b: Date) {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor(((utc2 - utc1) / 1000) * 60 * 60 * 24);
}

/**
 * Creates a new calendar event for the associated house.
 */
Calendar.post('/events', async (req: any, res: any) => {
  try {
    let reqEvent = req.body.event;
    if (!reqEvent || !reqEvent.Event)
      return res
        .status(500)
        .json({ title: 'request.error', msg: 'request.error' });

    let startDate = InputsToDate(reqEvent.start);
    let endDate = InputsToDate(reqEvent.end);
    let untilDate = InputsToDate(reqEvent.Event.untilDate);

    // Check if all inputs are valid
    if (
      !startDate ||
      !endDate ||
      !['none', 'day', 'week', 'twoweek', 'month'].includes(
        reqEvent.Event.repeat
      ) ||
      (reqEvent.Event.repeat !== 'none' && !untilDate) ||
      !reqEvent.Event.name?.length ||
      !reqEvent.Users?.length
    )
      return res
        .status(404)
        .json({ title: 'request.missingField', msg: 'request.missingField' });

    // Check if end date is 5 days after start date
    if (dateDiffInDays(startDate, endDate) > 5)
      return res.status(500).json({
        title: 'calendar.event.invalidLength',
        msg: 'calendar.event.over5Hours',
      });

    // Check if until date is before end date
    if (untilDate && untilDate <= endDate)
      return res.status(500).json({
        title: 'calendar.event.invalidUntilDate',
        msg: 'calendar.event.untilBeforeEnd',
      });

    // Check if start date is after end date
    if (startDate >= endDate)
      return res.status(500).json({
        title: 'calendar.event.invalidEndDate',
        msg: 'calendar.event.endBeforeStart',
      });

    let eventUsers = await getUsers(req, res);
    if (!eventUsers.length)
      return res.status(500).json({
        title: 'calendar.event.noUsers',
        msg: 'calendar.event.noUsers',
      });

    return await db.sequelize.transaction(async (t: any) => {
      let event = db.CalendarEvent.create(
        {
          name: reqEvent.Event.name,
          shared: reqEvent.Event.shared ?? true,
          repeat: reqEvent.Event.repeat,
          untilDate: untilDate,
        },
        { transaction: t }
      );

      // TODO: Create Occurences + Users (see Tasks.ts)

      return res.json({
        title: 'calendar.event.created',
        msg: 'calendar.event.created',
        event: event,
      });
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

export default Calendar;
