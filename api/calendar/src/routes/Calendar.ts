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
          as: 'Occurences',
          attributes: ['location', 'notes', 'start', 'end'],
          include: [
            {
              model: db.User,
              as: 'Users',
              attributes: ['id', 'firstname', 'lastname'],
              include: [{ model: db.Image, attributes: ['url'] }],
            },
          ],
        },
      ],
    });

    return res.json({
      title: 'request.success',
      msg: 'request.success',
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
