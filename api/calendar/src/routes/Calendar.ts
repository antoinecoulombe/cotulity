import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';
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

// ########################################################
// ######################### GET ##########################
// ########################################################

/**
 * Temporary placeholder get method.
 */
Calendar.get('/events', async (req: any, res: any) => {
  try {
    let events = await res.locals.home.getCalendarEvents({
      where: { [Op.or]: [{ ownerId: req.user.id }, { shared: true }] },
      attributes: ['ownerId', 'name', 'shared', 'repeat', 'untilDate'],
      include: [
        {
          model: db.CalendarEventOccurence,
          attributes: ['location', 'notes', 'start', 'end'],
          include: [{ model: db.CalendarEventUser, attributes: ['userId'] }],
        },
      ],
    });

    return res.json({
      title: 'request.notImplemented',
      msg: 'request.notImplemented',
      events: events,
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

// ########################################################
// ######################### POST #########################
// ########################################################

// ########################################################
// ######################## DELETE ########################
// ########################################################

export default Calendar;
