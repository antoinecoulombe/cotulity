import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';
import { InputsToDate } from '../../../shared/src/routes/Date';
import { getHomeUsers } from '../../../shared/src/routes/Homes';
import { getRepeatingDatesUntil } from '../../../shared/src/routes/Date';

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

interface HomeMember {
  id: number;
  firstname: string;
  lastname: string;
  Image: { url: string } | null;
}

interface CalendarEventOccurence {
  id?: number;
  location?: string;
  notes?: string;
  start?: string;
  end?: string;
  duration?: 30 | 60 | 120 | 150 | 180 | 240 | 300;
  Users: HomeMember[];
  Event?: CalendarEvent;
}

interface CalendarEvent {
  id?: number;
  name: string;
  shared: boolean;
  repeat: string;
  untilDate?: string;
}

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

/**
 * Creates and inserts the event occurences and their users in the database, at each 'repeat' until 'untilDate'.
 * @param eventOcc The event occurence.
 * @param transaction The sequelize transaction object.
 * @param repeat The repeat frequency string.
 * @param untilDate The repeat frequency end date.
 * @param deleteNext The date after which the event's occurences should be deleted.
 * @returns A promise to return an object containing created and deleted event occurences, with their users.
 */
const createEventOccurences = async (
  eventOcc: CalendarEventOccurence,
  start: Date,
  duration: number,
  transaction: any,
  repeat?: string,
  until?: Date | null,
  deleteNext?: Date
): Promise<{ created: any[]; deleted: number[] }> => {
  if (!eventOcc.Event) return { created: [], deleted: [] };

  // Init event occurence
  let eventOccurence = {
    calendarEventId: eventOcc.Event.id,
    Users: eventOcc.Users,
    location: eventOcc.location,
    notes: eventOcc.notes,
    Event: eventOcc.Event,
  };
  let oldIds: number[] = [];

  // Get all occurences
  let eventOccurences: any[] = getRepeatingDatesUntil(
    new Date(start),
    repeat,
    until
  ).map((o) => {
    let end = new Date(o);
    end.setMinutes(end.getMinutes() + duration);
    return { ...eventOccurence, start: o, end: end };
  });

  // Delete previous occurences
  if (deleteNext) {
    // Get ids of all previous occurences
    oldIds = (
      await db.CalendarEventOccurence.findAll(
        {
          where: {
            calendarEventId: eventOcc.Event.id,
            start: { [Op.gte]: deleteNext },
          },
        },
        { transaction: transaction }
      )
    ).map((oto: any) => oto.id);

    // Delete users associated to all previous event occurence ids
    await db.CalendarEventUser.destroy(
      {
        where: { calendarEventOccurenceId: oldIds },
        force: true,
      },
      { transaction: transaction }
    );

    // Delete all previous event occurences
    await db.CalendarEventOccurence.destroy(
      {
        where: { id: oldIds },
        force: true,
      },
      { transaction: transaction }
    );
  }

  // Create new event occurences
  let calendarOccurencesDb = await db.CalendarEventOccurence.bulkCreate(
    eventOccurences,
    {
      transaction: transaction,
    }
  );

  // Get ids from inserted event occurences and associate them with corresponding local event occurences
  eventOccurences = eventOccurences.map((e: any) => {
    // Get local event occurence date string
    let eDate: string = new Date(e.start).toUTCString();

    // Find the inserted event occurence with the same date
    let eventOcc = calendarOccurencesDb.find(
      (eDb: any) => new Date(eDb.start).toUTCString() == eDate
    );

    // Check if a event occurence is found
    if (!eventOcc)
      throw new Error(
        `Couldn't find CalendarEventOccurence with date equal to '${eDate}'`
      );

    // Merge the local event occurence with the found event occurence id
    return { ...e, id: eventOcc.id, calendarEventId: undefined };
  });

  let eventUsers: { userId: number; calendarEventOccurenceId: number }[] = [];

  // Get users for each event occurence and push them to an array for bulk insertion
  eventOccurences.forEach((t) => {
    t.Users.forEach((u: any) =>
      eventUsers.push({ userId: u.id, calendarEventOccurenceId: t.id })
    );
  });

  // Create users for each of those event occurences
  await db.CalendarEventUser.bulkCreate(eventUsers, {
    transaction: transaction,
  });

  return { created: eventOccurences, deleted: oldIds };
};

/**
 * Checks for errors in an occurence.
 * @param occurence The event occurence.
 * @param startDate The event's start date.
 * @param endDate The event's end date. Should be after 'startDate'.
 * @param untilDate The event's repeat date.
 * @param users The event's users.
 * @returns If an error is found, an object containing the status code
 * and the notification title and message. Otherwise, null.
 */
const getErrors = (
  occurence: any,
  startDate: Date | null,
  endDate: Date | null,
  untilDate: Date | null,
  users: any[]
): { status: 404 | 500; notif: { title: string; msg: string } } | null => {
  // Check if all inputs are valid
  if (
    !startDate ||
    !endDate ||
    !['none', 'day', 'week', 'twoweek', 'month'].includes(
      occurence.Event.repeat
    ) ||
    (occurence.Event.repeat !== 'none' && !untilDate) ||
    !occurence.Event.name?.length ||
    !occurence.Users?.length
  )
    return {
      status: 404,
      notif: { title: 'request.missingField', msg: 'request.missingField' },
    };

  // Check if end date is 5 days after start date
  if (![30, 60, 90, 120, 150, 180, 240, 300].includes(occurence.duration))
    return {
      status: 500,
      notif: {
        title: 'calendar.event.invalidLength',
        msg: 'calendar.event.over5Hours',
      },
    };

  // Check if until date is before end date
  if (occurence.Event.repeat !== 'none' && untilDate && untilDate <= endDate)
    return {
      status: 500,
      notif: {
        title: 'calendar.event.invalidUntilDate',
        msg: 'calendar.event.untilBeforeEnd',
      },
    };

  // Check if start date is after end date
  if (startDate >= endDate)
    return {
      status: 500,
      notif: {
        title: 'calendar.event.invalidEndDate',
        msg: 'calendar.event.endBeforeStart',
      },
    };

  // Check if event has users
  if (!users.length)
    return {
      status: 500,
      notif: {
        title: 'calendar.event.noUsers',
        msg: 'calendar.event.noUsers',
      },
    };

  return null;
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
          where: { homeId: res.locals.home.id },
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

    events = events.filter(
      (eo: any) =>
        eo.Event.shared ||
        eo.Users.filter((eou: any) => eou.id === req.user.id).length > 0
    );

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

/**
 * Modifies a calendar event found in the associated house.
 */
Calendar.put('/events/:id', async (req: any, res: any) => {
  try {
    let reqEvent = req.body.event;
    let updateAll = req.body.updateAll;

    // Check if event exists in request
    if (!reqEvent || !reqEvent.Event)
      return res
        .status(500)
        .json({ title: 'request.error', msg: 'request.error' });

    // Get Dates
    let startDate = InputsToDate(reqEvent.start, false);
    let endDate = InputsToDate(reqEvent.end, false);
    let untilDate = InputsToDate(reqEvent.Event.untilDate, false);

    // Get event users
    let eventUsers = await getUsers(req, res);

    // Check for errors and return it to client if one is found
    let error = getErrors(reqEvent, startDate, endDate, untilDate, eventUsers);
    if (error) return res.status(error.status).json(error.notif);
    if (!reqEvent.Event.id)
      return res
        .status(500)
        .json({ title: 'request.error', msg: 'request.error' });

    // Get event with all occurences
    let eventDb = await db.CalendarEvent.findOne({
      where: { id: reqEvent.Event.id, homeId: res.locals.home.id },
      include: [{ model: db.CalendarEventOccurence, as: 'Occurences' }],
    });
    if (!eventDb)
      return res.status(404).json({
        title: 'calendar.event.notFound',
        msg: 'calendar.event.notFound',
      });

    // Deny access if requester is not home owner or event creator
    if (
      res.locals.home.ownerId !== req.user.id &&
      eventDb.ownerId !== req.user.id
    )
      return res.status(403).json({
        title: 'request.denied',
        msg: 'calendar.event.cannotUpdate',
      });

    // Update event's fields
    eventDb.name = reqEvent.Event.name;
    if (updateAll) {
      eventDb.shared = reqEvent.Event.shared;
      eventDb.repeat = reqEvent.Event.repeat;
      eventDb.untilDate = untilDate;
    }

    return await db.sequelize.transaction(async (t: any) => {
      await eventDb.save({ transaction: t });

      if (updateAll) {
        // Create base event occurence
        let eventOccurence: CalendarEventOccurence = {
          Users: eventUsers,
          location: reqEvent.location,
          notes: reqEvent.notes,
          Event: {
            ...reqEvent.Event,
            id: reqEvent.Event.id,
            ownerId: req.user.id,
          },
        };

        // Create all event occurences from base event occurence
        let eventOccurences = await createEventOccurences(
          eventOccurence,
          startDate ?? new Date(),
          reqEvent.duration,
          t,
          reqEvent.Event.repeat,
          untilDate,
          startDate ?? undefined
        );
        if (!eventOccurences.created.length)
          throw 'No Occurences Created (An error occured)';

        return res.json({
          title: 'calendar.event.modified',
          msg: 'calendar.event.modified',
          created: eventOccurences.created,
          deleted: eventOccurences.deleted,
        });
      } else {
        // Get event occurence
        let eventOccDb = await db.CalendarEventOccurence.findOne({
          where: { id: reqEvent.id },
          include: [
            {
              model: db.CalendarEvent,
              as: 'Event',
              where: { homeId: res.locals.home.id },
            },
          ],
        });
        if (!eventOccDb)
          return res.status(404).json({
            title: 'calendar.event.notFound',
            msg: 'calendar.event.notFound',
          });

        // Update event occurence
        eventOccDb.start = startDate;
        eventOccDb.end = endDate;
        eventOccDb.notes = reqEvent.notes;
        eventOccDb.location = reqEvent.location;
        await eventOccDb.save({ transaction: t });

        return res.json({
          title: 'calendar.event.modified',
          msg: 'calendar.event.modified',
          created: {
            ...reqEvent,
            start: startDate,
            end: endDate,
            notes: reqEvent.notes,
            location: reqEvent.location,
            Event: {
              ...reqEvent.Event,
              name: reqEvent.Event.name,
              shared: eventDb.shared,
              repeat: eventDb.repeat,
              untilDate: eventDb.untilDate,
            },
          },
          deleted: [reqEvent.id],
        });
      }
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

/**
 * Moves a single calendar event found in the associated house.
 */
Calendar.put('/events/:id/move', async (req: any, res: any) => {
  try {
    if (!req.body.start)
      return res
        .status(500)
        .json({ title: 'request.missingField', msg: 'request.missingField' });

    let event = await res.locals.home.getCalendarEvents({
      include: [
        {
          model: db.CalendarEventOccurence,
          as: 'Occurences',
          where: { id: req.params.id },
        },
      ],
    });

    // Get event occurence
    let occ = event?.[0]?.Occurences?.[0];

    // Check if event occurence exists
    if (!occ)
      return res.status(404).json({
        title: 'calendar.event.notFound',
        msg: 'calendar.event.notFound',
      });

    // Deny access if requester is not home owner or event creator
    if (res.locals.home.ownerId !== req.user.id && occ.ownerId !== req.user.id)
      return res.status(403).json({
        title: 'request.denied',
        msg: 'calendar.event.cannotUpdate',
      });

    // Calculate new start and end date
    let diff = new Date(occ.start).getTime() - new Date(occ.end).getTime();
    let newEnd = new Date(req.body.start);
    newEnd.setTime(new Date(req.body.start).getTime() - diff);

    occ.start = new Date(req.body.start);
    occ.end = newEnd;
    await occ.save();

    return res.json({
      title: 'calendar.event.moved',
      msg: 'calendar.event.modified',
      start: new Date(req.body.start),
      end: newEnd,
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### POST #########################
// ########################################################

/**
 * Creates a new calendar event for the associated house.
 */
Calendar.post('/events', async (req: any, res: any) => {
  try {
    let reqEvent = req.body.event;

    // Check if event exists in request
    if (!reqEvent || !reqEvent.Event)
      return res
        .status(500)
        .json({ title: 'request.error', msg: 'request.error' });

    // Get dates
    let startDate = InputsToDate(reqEvent.start, false);
    let endDate = InputsToDate(reqEvent.end, false);
    let untilDate = InputsToDate(reqEvent.Event.untilDate, false);

    // Get event users
    let eventUsers = await getUsers(req, res);

    // Check for errors and return it to client if one is found
    let error = getErrors(reqEvent, startDate, endDate, untilDate, eventUsers);
    if (error) return res.status(error.status).json(error.notif);

    return await db.sequelize.transaction(async (t: any) => {
      // Create event
      let event = await db.CalendarEvent.create(
        {
          homeId: res.locals.home.id,
          ownerId: req.user.id,
          name: reqEvent.Event.name,
          shared: reqEvent.Event.shared ?? true,
          repeat: reqEvent.Event.repeat,
          untilDate: untilDate,
        },
        { transaction: t }
      );

      // Create base event occurence
      let eventOccurence: CalendarEventOccurence = {
        Users: eventUsers,
        location: reqEvent.location,
        notes: reqEvent.notes,
        Event: { ...reqEvent.Event, id: event.id, ownerId: req.user.id },
      };

      // Create all event occurences, with their users, from base event occurence
      let eventOccurences = await createEventOccurences(
        eventOccurence,
        startDate ?? new Date(),
        reqEvent.duration,
        t,
        reqEvent.Event.repeat,
        untilDate
      );
      if (!eventOccurences.created.length)
        throw 'No Occurences Created (An error occured)';

      return res.json({
        title: 'calendar.event.created',
        msg: 'calendar.event.created',
        created: eventOccurences.created,
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

/**
 * Deletes a calendar event found in the associated house.
 */
Calendar.delete('/events/:id', async (req: any, res: any) => {
  try {
    let deleteAll = req.body.deleteAll ?? false;

    let eventOneOccurence = await res.locals.home.getCalendarEvents({
      include: [
        {
          model: db.CalendarEventOccurence,
          as: 'Occurences',
          where: { id: req.params.id },
        },
      ],
    });

    // Get event occurence
    let occ = eventOneOccurence?.[0]?.Occurences?.[0];

    // Check if event occurence exists
    if (!occ)
      return res.status(404).json({
        title: 'calendar.event.notFound',
        msg: 'calendar.event.notFound',
      });

    // Deny access if requester is not home owner or event creator
    if (res.locals.home.ownerId !== req.user.id && occ.ownerId !== req.user.id)
      return res.status(403).json({
        title: 'request.denied',
        msg: 'calendar.event.cannotDelete',
      });

    let deleteIds: number[] = [];

    let eventAllOccurences = await db.CalendarEvent.findOne({
      where: { id: eventOneOccurence[0].id },
      include: [{ model: db.CalendarEventOccurence, as: 'Occurences' }],
    });

    let deleteEvent = eventAllOccurences.Occurences.length == 1;

    if (!deleteAll) deleteIds.push(occ.id);
    else {
      eventAllOccurences.Occurences.forEach((o: any) => {
        if (new Date(o.start) >= new Date(occ.start)) deleteIds.push(o.id);
      });
    }

    return await db.sequelize.transaction(async (t: any) => {
      await db.CalendarEventUser.destroy(
        {
          where: { calendarEventOccurenceId: deleteIds },
          force: true,
        },
        { transaction: t }
      );

      await db.CalendarEventOccurence.destroy(
        {
          where: { id: deleteIds },
          force: true,
        },
        { transaction: t }
      );

      if (deleteEvent)
        await db.CalendarEvent.destroy(
          {
            where: { id: eventAllOccurences.id },
            force: true,
          },
          { transaction: t }
        );

      return res.json({
        title: 'calendar.event.deleted',
        msg: 'calendar.event.deleted',
        deletedIds: deleteIds,
      });
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Calendar;
