import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';
import { InputsToDate } from '../../../shared/src/routes/Global';
import { getHomeUsers } from '../../../shared/src/routes/Homes';

const Tasks = express.Router();
const db = require('../../../shared/db/models');
const { Op } = require('sequelize');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

/**
 * Verifies that the app is online.
 */
Tasks.use(async (req: any, res, next) => {
  req.params.appname = 'tasks';
  validateApp(req, res, next);
});

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

interface TaskOccurence {
  taskId: number;
  Users: any[];
  dueDate: Date;
  important: boolean;
  Task?: Task;
  completedOn?: string | null;
  deletedAt?: string | null;
}

interface Task {
  shared: boolean;
  repeat: string;
  untilDate?: Date;
}

/**
 * Gets all home tasks.
 * @param req The HTTP request.
 * @param res The HTTP response.
 * @param when Either 'all', 'completed' or 'upcoming'. Represents which
 * tasks should be returned.
 * @param occurenceId If specified, gets the task associated with the task
 * occurence with this id.
 * @returns A promise to return an array of tasks.
 */
const getTasks = async (
  req: any,
  res: any,
  when: string,
  occurenceId?: number
): Promise<any> => {
  try {
    return await res.locals.home.getTasks({
      where: {
        [Op.or]: [{ shared: true }, { ownerId: req.user.id }],
      },
      attributes: ['id', 'name', 'shared', 'repeat', 'untilDate'],
      include: [
        {
          model: db.TaskOccurence,
          as: 'Occurences',
          where: {
            id: occurenceId == undefined ? { [Op.ne]: 0 } : occurenceId,
            [Op.or]:
              when == 'all'
                ? [{ completedOn: null }, { completedOn: { [Op.ne]: null } }]
                : when == 'completed'
                ? [{ completedOn: { [Op.ne]: null } }]
                : [{ completedOn: null }],
          },
          attributes: [
            'id',
            'dueDateTime',
            'completedOn',
            'deletedAt',
            'important',
          ],
          include: {
            model: db.User,
            as: 'Users',
            attributes: ['id', 'firstname', 'lastname'],
            include: { model: db.Image, attributes: ['url'] },
          },
          paranoid: false,
        },
        {
          model: db.User,
          as: 'Owner',
          attributes: ['id', 'firstname', 'lastname'],
          include: { model: db.Image, attributes: ['url'] },
        },
      ],
      paranoid: false,
    });
  } catch (e) {
    /* istanbul ignore next */
    throw e;
  }
};

/**
 * Gets all occurences of a Date until 'untilDate'.
 * @param dueDate The date of the first task occurence.
 * @param repeat The task frequency. Either 'day', 'week', 'twoweek' or 'month'.
 * @param untilDate The date of the last task occurence.
 * @returns A string array containing the task occurences, as UTC string.
 */
const getRepeatingDatesUntil = (
  dueDate: Date,
  repeat?: string,
  untilDate?: Date | null
): string[] => {
  let occurences: string[] = [];
  occurences.push(dueDate.toUTCString());

  // Check if task repeats
  if (repeat && untilDate && repeat !== 'none') {
    let valid: boolean = true;
    let untilMilliseconds = untilDate.getTime();
    let dueMilliseconds = dueDate.getTime();

    // While task occurence is before 'untilDate', with a limit of 50 occurences
    while (dueMilliseconds <= untilMilliseconds && occurences.length < 50) {
      switch (repeat) {
        case 'day':
          dueDate.setDate(dueDate.getDate() + 1);
          break;
        case 'week':
          dueDate.setDate(dueDate.getDate() + 7);
          break;
        case 'twoweek':
          dueDate.setDate(dueDate.getDate() + 14);
          break;
        case 'month':
          dueDate.setMonth(dueDate.getMonth() + 1);
          break;
        default:
          valid = false;
          break;
      }

      dueMilliseconds = dueDate.getTime();

      // Make sure the task occurence is before 'untilDate'
      if (!valid || dueMilliseconds > untilMilliseconds) break;

      occurences.push(dueDate.toUTCString());
    }
  }

  return occurences;
};

/**
 * Gets the task users.
 * @param req The HTTP request.
 * @param res The HTTP response.
 * @returns An array containing the task users.
 */
const getUsers = async (req: any, res: any) => {
  let members = await getHomeUsers(db, res);

  // If the task isn't shared, return only the requester id
  if (req.body.task.Task.shared == false)
    return members.filter((m: any) => m.id === req.user.id);
  else {
    // Otherwise, return all users in request intersecting with home members
    return members.filter(
      (m: any) =>
        req.body.task.Users.filter((u: any) => u.id === m.id).length > 0
    );
  }
};

/**
 * Sends an error response if conditions aren't met
 * @param users The task users.
 * @param repeat The task repeat frequency string.
 * @param res The HTTP response.
 * @returns A boolean indicating whether or not an error response was sent.
 */
const respondIfErrors = (users: any[], repeat: string, res: any): boolean => {
  // Check if task has users
  if (!users.length) {
    res.status(500).json({ title: 'tasks.noUsers', msg: 'tasks.noUsers' });
    return true;
  }

  // Check if the repeat string is valid
  let repeatOptions: string[] = ['none', 'day', 'week', 'twoweek', 'month'];
  if (!repeatOptions.includes(repeat)) {
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
    return true;
  }

  return false;
};

/**
 * Creates and inserts the task occurences and their users in the database, at each 'repeat' until 'untilDate'.
 * @param taskOcc The task occurence.
 * @param transaction The sequelize transaction object.
 * @param repeat The repeat frequency string.
 * @param untilDate The repeat frequency end date.
 * @param deleteOld A boolean indicating whether or not the old task occurences
 * associated to a task should be deleted.
 * @returns A promise to return an object containing created and deleted task occurences, with their users.
 */
const createTaskOccurences = async (
  taskOcc: TaskOccurence,
  transaction: any,
  repeat: string,
  untilDate?: Date | null,
  deleteOld?: number
): Promise<{ created: any[]; deleted: number[] }> => {
  // Get first task occurence date
  let firstDueDate = new Date(taskOcc.dueDate);

  // Init task occurence
  let taskOccurence = {
    taskId: taskOcc.taskId,
    Users: taskOcc.Users,
    important: taskOcc.important,
  };
  let oldIds: number[] = [];

  // Get all occurences
  let taskOccurences: any[] = getRepeatingDatesUntil(
    taskOcc.dueDate,
    repeat,
    untilDate
  ).map((o) => {
    return { ...taskOccurence, dueDateTime: o };
  });

  // Delete previous occurences
  if (deleteOld) {
    // Get ids of all previous occurences
    let oldIds = (
      await db.TaskOccurence.findAll(
        {
          where: {
            taskId: taskOcc.taskId,
            [Op.or]: {
              id: { [Op.gte]: deleteOld },
              dueDateTime: {
                [Op.gte]: firstDueDate,
              },
            },
          },
        },
        { transaction: transaction }
      )
    ).map((oto: any) => oto.id);

    // Delete users associated to all previous task occurence ids
    await db.TaskUser.destroy(
      {
        where: { taskOccurenceId: oldIds },
        force: true,
      },
      { transaction: transaction }
    );

    // Delete all previous task occurences
    await db.TaskOccurence.destroy(
      {
        where: { id: oldIds },
        force: true,
      },
      { transaction: transaction }
    );
  }

  // Create new task occurences
  let taskOccurencesDb = await db.TaskOccurence.bulkCreate(taskOccurences, {
    transaction: transaction,
  });

  // Get ids from inserted task occurences and associate them with corresponding local task occurences
  taskOccurences = taskOccurences.map((t: any) => {
    // Get local task occurence date string
    let tDate: string = new Date(t.dueDateTime).toUTCString();

    // Find the inserted task occurence with the same date
    let taskOcc = taskOccurencesDb.find(
      (tDb: any) => new Date(tDb.dueDateTime).toUTCString() == tDate
    );

    // Check if a task occurence is found
    if (!taskOcc)
      throw new Error(
        `Couldn't find taskOccurence with date equal to '${tDate}'`
      );

    // Merge the local task occurence with the found task occurence id
    return { ...t, id: taskOcc.id };
  });

  let taskUsers: { userId: number; taskOccurenceId: number }[] = [];

  // Get users for each task occurence and push them to an array for bulk insertion
  taskOccurences.forEach((t) => {
    t.completedOn = null;
    t.deletedAt = null;
    t.Users.forEach((u: any) =>
      taskUsers.push({ userId: u.id, taskOccurenceId: t.id })
    );
  });

  // Create users for each of those task occurences
  await db.TaskUser.bulkCreate(taskUsers, { transaction: transaction });

  return { created: taskOccurences, deleted: oldIds };
};

// ########################################################
// ######################### GET ##########################
// ########################################################

/**
 * Gets all home tasks.
 */
Tasks.get('/', async (req: any, res: any) => {
  try {
    let tasks = await getTasks(req, res, 'all');
    return res.json({
      title: 'request.success',
      msg: 'request.success',
      tasks: tasks,
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

/**
 * Gets all home users.
 */
Tasks.get('/users', async (req: any, res: any) => {
  try {
    // Create a Date object two weeks from now
    var inTwoWeeks = new Date();
    inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

    // Get all accepted home users
    let users = await getHomeUsers(db, res);

    // Get all task occurences associated to each user
    let usersWithTasks = await Promise.all(
      users.map(async (u: any) => {
        let taskOccurences = await u.getTaskOccurences({
          where: {
            [Op.and]: [
              { dueDateTime: { [Op.gte]: new Date() } },
              { dueDateTime: { [Op.lte]: inTwoWeeks } },
            ],
          },
          include: [
            {
              model: db.Task,
              as: 'Task',
              attributes: ['shared'],
              where: {
                [Op.or]: [{ shared: true }, { ownerId: req.user.id }],
              },
            },
          ],
          attributes: ['taskId', 'deletedAt', 'completedOn', 'dueDateTime'],
          order: ['dueDateTime'],
        });

        // Merge the user sequelize object with its task occurences
        return { ...u.dataValues, TaskOccurences: taskOccurences };
      })
    );

    res.json({
      title: 'request.success',
      msg: 'request.success',
      users: usersWithTasks,
    });
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

/**
 * Gets all upcoming tasks.
 */
Tasks.get('/upcoming', async (req: any, res: any) => {
  try {
    let tasks = await getTasks(req, res, 'upcoming');
    res.json({
      title: 'request.success',
      msg: 'request.success',
      tasks: tasks,
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

/**
 * Gets all completed tasks.
 */
Tasks.get('/completed', async (req: any, res: any) => {
  try {
    let tasks = await getTasks(req, res, 'completed');
    res.json({
      title: 'request.success',
      msg: 'request.success',
      tasks: tasks,
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
 * Modifies a task and its taskOccurences.
 */
Tasks.put('/:id', async (req: any, res: any) => {
  try {
    // Convert input strings to Date objects
    let dueDate = InputsToDate(req.body.task.dueDateTime);
    let untilDate = req.body.task.Task.untilDate
      ? InputsToDate(req.body.task.Task.untilDate)
      : null;

    return await db.sequelize.transaction(async (t: any) => {
      // Check if dueDate is valid
      if (dueDate === null)
        return res
          .status(500)
          .json({ title: 'task.invalidDate', msg: 'task.invalidDate' });

      // Get task that has a certain task occurence id associated to it
      let taskDb = await getTasks(req, res, 'all', req.params.id);
      if (!taskDb?.length)
        return res
          .status(404)
          .json({ title: 'task.notFound', msg: 'task.notFound' });

      // Get first found task (should be only one), and modify it
      let task = taskDb[0];
      task.name = req.body.task.Task.name;
      task.repeat = req.body.task.Task.repeat;
      task.untilDate = untilDate;

      // Get all task users
      let taskUsers: any[] = await getUsers(req, res);

      // Send an error if errors are found
      if (respondIfErrors(taskUsers, req.body.task.Task.repeat, res)) return;

      await task.save({ transaction: t });

      // Create base task occurence
      let taskOccurence: TaskOccurence = {
        taskId: task.id,
        Users: taskUsers,
        dueDate: dueDate,
        important: req.body.task.important,
        completedOn: null,
        deletedAt: null,
      };

      // Create all task occurences from base task occurence
      let taskOccurences = await createTaskOccurences(
        taskOccurence,
        t,
        req.body.task.Task.repeat,
        untilDate,
        req.params.id
      );

      return res.json({
        title: 'tasks.modified',
        msg: 'tasks.modified',
        task: {
          ...task.dataValues,
          name: req.body.task.Task.name,
          repeat: req.body.task.Task.repeat,
          untilDate: untilDate,
          Occurences: taskOccurences.created,
          completedOn: null,
          deletedAt: null,
        },
        deletedIds: taskOccurences.deleted,
      });
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

/**
 *
 * @param req The HTTP request.
 * @param res The HTTP response.
 * @param toComplete A boolean indicating whether or not the task should be completed
 * (if set to 'true', means that the task is currently not completed and will be after this method).
 */
const editCompletion = async (req: any, res: any, toComplete: boolean) => {
  try {
    // Search upcoming tasks (not completed) if 'toComplete' is true. Otherwise, search completed tasks
    let tasks = await getTasks(
      req,
      res,
      toComplete ? 'upcoming' : 'completed',
      req.params.id
    );

    // Check if task exists
    if (!tasks.length)
      return res
        .status(404)
        .json({ title: 'task.notFound', msg: 'task.notFound' });

    // Get first occurence of first task (should be only one in both case)
    let taskOccurence = tasks[0].Occurences[0];

    // Set completion
    taskOccurence.completedOn = toComplete ? new Date() : null;
    await taskOccurence.save();

    res.json({
      title: 'request.success',
      msg: 'request.success',
      completedOn: taskOccurence.completedOn,
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
};

/**
 * Completes a task.
 */
Tasks.put('/:id/do', async (req: any, res: any) =>
  editCompletion(req, res, true)
);

/**
 * Uncompletes a task.
 */
Tasks.put('/:id/undo', async (req: any, res: any) =>
  editCompletion(req, res, false)
);

/**
 * Restores a task occurence.
 */
Tasks.put('/:id/restore', async (req: any, res: any) => {
  try {
    // Get task associated with task occurence id
    let tasks = await getTasks(req, res, 'all', req.params.id);

    // Check if task exists
    if (!tasks.length)
      return res
        .status(404)
        .json({ title: 'task.notFound', msg: 'task.notFound' });

    // Restore task occurence
    await tasks[0].Occurences[0].restore();

    res.json({
      title: 'request.success',
      msg: 'request.success',
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
 * Creates a new task.
 */
Tasks.post('/', async (req: any, res: any) => {
  try {
    // Convert input strings to Date objects
    let dueDate = InputsToDate(req.body.task.dueDateTime);
    let untilDate = req.body.task.Task.untilDate
      ? InputsToDate(req.body.task.Task.untilDate)
      : null;

    return await db.sequelize.transaction(async (t: any) => {
      // Check if dueDate is valid
      if (dueDate === null)
        return res
          .status(500)
          .json({ title: 'task.invalidDate', msg: 'task.invalidDate' });

      // Get all task users
      let taskUsers: any[] = await getUsers(req, res);

      // Send an error if errors are found
      if (respondIfErrors(taskUsers, req.body.task.Task.repeat, res)) return;

      // Create Task
      let task = await db.Task.create(
        {
          homeId: res.locals.home.id,
          ownerId: req.user.id,
          name: req.body.task.Task.name,
          repeat: req.body.task.Task.repeat,
          shared: req.body.task.Task.shared,
          untilDate: untilDate,
        },
        { transaction: t }
      );

      // Create base task occurence
      let taskOccurence: TaskOccurence = {
        taskId: task.id,
        Users: taskUsers,
        dueDate: dueDate,
        important: req.body.task.important,
        completedOn: null,
        deletedAt: null,
      };

      // Create all task occurences from base task occurence
      let taskOccurences = await createTaskOccurences(
        taskOccurence,
        t,
        req.body.task.Task.repeat,
        untilDate
      );

      return res.json({
        title: 'tasks.created',
        msg: 'tasks.created',
        task: { ...task.dataValues, Occurences: taskOccurences.created },
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
 * Deletes the task occurence with the specified id.
 */
Tasks.delete('/:id', async (req: any, res: any) => {
  try {
    // Get task associated with task occurence id
    let tasks = await getTasks(req, res, 'all', req.params.id);

    // Check if task exists
    if (!tasks.length)
      return res
        .status(404)
        .json({ title: 'task.notFound', msg: 'task.notFound' });

    // Get first found task (should be only one)
    let task = tasks[0];

    return await db.sequelize.transaction(async (t: any) => {
      // if task occurence is already soft deleted, hard delete it (force = true)
      var deletedAt =
        task.Occurences[0].deletedAt === null ? new Date().toUTCString() : null;
      let force = deletedAt === null;

      // Delete task occurence users
      if (force) {
        await db.TaskUser.destroy(
          { where: { taskOccurenceId: req.params.id }, force: true },
          { transaction: t }
        );
      }

      // Delete task occurence
      await db.TaskOccurence.destroy({
        where: { id: req.params.id },
        force: force,
      });

      if (force) {
        // Delete task if no more occurences
        let taskOccurenceCount = await db.TaskOccurence.count({
          where: { taskId: task.id },
          paranoid: false,
        });
        if (taskOccurenceCount === 0) await task.destroy({ force: true });
      }

      return res.json({
        title: 'request.success',
        msg: 'request.success',
        deletedAt: deletedAt,
      });
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Tasks;
