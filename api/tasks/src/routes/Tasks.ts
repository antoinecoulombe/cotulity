import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';

const Tasks = express.Router();
const db = require('../../../shared/db/models');
const { Op } = require('sequelize');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

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
  repeat: string;
  untilDate: Date | null;
  important: boolean;
}

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
      attributes: ['id', 'name', 'shared'],
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

const toDate = (dateString: string): Date | null => {
  try {
    if (!dateString.includes('@')) dateString += '@23:59';

    // 09/08@20:42
    let dateSplit = dateString.split('@');
    let dayMonth: number[] = dateSplit[0].split('/').map((x) => +x);
    let hourMinute: number[] = dateSplit[1].split(':').map((x) => +x);

    let now = new Date();
    let month = dayMonth[1] - 1;
    return new Date(
      month < now.getMonth() ||
      (month == now.getMonth() && dayMonth[0] < now.getDay())
        ? now.getFullYear() + 1
        : now.getFullYear(),
      month,
      dayMonth[0],
      hourMinute[0],
      hourMinute[1]
    );
  } catch (e) {
    return null;
  }
};

const getRepeatingDatesUntil = (
  repeat: string,
  dueDate: Date,
  untilDate: Date | null
): string[] => {
  let occurences: string[] = [];
  occurences.push(dueDate.toUTCString());

  if (repeat !== 'none' && untilDate !== null) {
    let valid: boolean = true;
    let untilMilliseconds = untilDate.getTime();
    let dueMilliseconds = dueDate.getTime();

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
      if (!valid || dueMilliseconds > untilMilliseconds) break;

      occurences.push(dueDate.toUTCString());
    }
  }

  return occurences;
};

const getUsers = async (req: any, res: any) => {
  let members = await res.locals.home.getMembers({
    attributes: ['id', 'firstname', 'lastname'],
    include: [
      {
        model: db.Image,
        as: 'Image',
        attributes: ['url'],
      },
    ],
  });

  if (req.body.task.shared == false)
    return members.filter((m: any) => m.id === req.user.id);
  else {
    return members.filter(
      (u: any) =>
        req.body.task.Users.filter((id: any) => id === u.id).length > 0
    );
  }
};

const respondIfErrors = (users: any[], repeat: string, res: any) => {
  if (!users.length) {
    res.status(500).json({ title: 'tasks.noUsers', msg: 'tasks.noUsers' });
    return true;
  }

  let repeatOptions: string[] = ['none', 'day', 'week', 'twoweek', 'month'];
  if (!repeatOptions.includes(repeat)) {
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
    return true;
  }

  return false;
};

const createTaskOccurences = async (
  task: TaskOccurence,
  transaction: any,
  deleteOld?: number
) => {
  let firstDueDate = new Date(task.dueDate);
  let taskOccurence = { taskId: task.taskId, Users: task.Users };

  let taskOccurences: any[] = getRepeatingDatesUntil(
    task.repeat,
    task.dueDate,
    task.untilDate
  ).map((o) => {
    return { ...taskOccurence, dueDateTime: o };
  });

  if (deleteOld) {
    let oldTaskOccurences = await db.TaskOccurence.findAll(
      {
        where: {
          taskId: task.taskId,
          [Op.or]: {
            id: { [Op.gte]: deleteOld },
            dueDateTime: {
              [Op.gte]: firstDueDate,
            },
          },
        },
      },
      { transaction: transaction }
    );

    let otoIds = oldTaskOccurences.map((oto: any) => oto.id);

    await db.UserTask.destroy(
      {
        where: { taskOccurenceId: otoIds },
        force: true,
      },
      { transaction: transaction }
    );

    await db.TaskOccurence.destroy(
      {
        where: { id: otoIds },
        force: true,
      },
      { transaction: transaction }
    );
  }

  // Create task occurences
  let taskOccurencesDb = await db.TaskOccurence.bulkCreate(taskOccurences, {
    transaction: transaction,
  });

  taskOccurences = taskOccurences.map((t: any) => {
    let tDate: string = new Date(t.dueDateTime).toUTCString();
    let taskOcc = taskOccurencesDb.find(
      (tDb: any) => new Date(tDb.dueDateTime).toUTCString() == tDate
    );

    if (!taskOcc)
      throw new Error(
        `Couldn't find taskOccurence with date equal to '${tDate}'`
      );

    return { ...t, id: taskOcc.id };
  });

  let userTasks: { userId: number; taskOccurenceId: number }[] = [];
  taskOccurences.forEach((t) => {
    t.Users.forEach((u: any) =>
      userTasks.push({ userId: u.id, taskOccurenceId: t.id })
    );
  });

  // Create users for each of those task occurences
  await db.UserTask.bulkCreate(userTasks, { transaction: transaction });

  return taskOccurences;
};

// ########################################################
// ######################### GET ##########################
// ########################################################

// Get all tasks
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

// Get all upcoming tasks
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

// Get all completed tasks.
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

// Modifies a task and its taskOccurences.
Tasks.put('/:id', async (req: any, res: any) => {
  try {
    let dueDate = toDate(req.body.task.dueDateTime);
    let untilDate = req.body.task.untilDateTime
      ? toDate(req.body.task.untilDateTime)
      : null;

    return await db.sequelize.transaction(async (t: any) => {
      if (dueDate === null)
        return res
          .status(500)
          .json({ title: 'task.invalidDate', msg: 'task.invalidDate' });

      let taskDb = await getTasks(req, res, 'all', req.params.id);
      if (!taskDb?.length)
        return res
          .status(404)
          .json({ title: 'task.notFound', msg: 'task.notFound' });

      let task = taskDb[0];

      task.name = req.body.task.name;
      task.dueDateTime = dueDate;
      task.important = req.body.task.important;
      if (task.ownerId === req.user.id) task.shared = req.body.task.shared;

      let taskUsers: any[] = await getUsers(req, res);

      if (respondIfErrors(taskUsers, req.body.task.repeat, res)) return;

      await task.save({ transaction: t });

      let taskOccurence: TaskOccurence = {
        taskId: task.id,
        Users: taskUsers,
        dueDate: dueDate,
        repeat: req.body.task.repeat,
        untilDate: untilDate,
        important: task.important,
      };
      let taskOccurences = await createTaskOccurences(
        taskOccurence,
        t,
        req.params.id
      );

      return res.json({
        title: 'tasks.modified',
        msg: 'tasks.modified',
        task: { ...task.dataValues, Occurences: taskOccurences },
      });
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

const editCompletion = async (req: any, res: any, done: boolean) => {
  try {
    let tasks = await getTasks(
      req,
      res,
      done ? 'upcoming' : 'completed',
      req.params.id
    );
    if (!tasks.length)
      return res
        .status(404)
        .json({ title: 'task.notFound', msg: 'task.notFound' });

    let taskOccurence = tasks[0].Occurences[0];
    taskOccurence.completedOn = done ? new Date() : null;
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

// Completes a task.
Tasks.put('/:id/do', async (req: any, res: any) =>
  editCompletion(req, res, true)
);

// Uncompletes a task.
Tasks.put('/:id/undo', async (req: any, res: any) =>
  editCompletion(req, res, false)
);

// Restores a task occurence.
Tasks.put('/:id/restore', async (req: any, res: any) => {
  try {
    let tasks = await getTasks(req, res, 'all', req.params.id);
    if (tasks.length == 0)
      return res
        .status(404)
        .json({ title: 'task.notFound', msg: 'task.notFound' });

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

// Creates a new task.
Tasks.post('/', async (req: any, res: any) => {
  try {
    let dueDate = toDate(req.body.task.dueDateTime);
    let untilDate = req.body.task.untilDateTime
      ? toDate(req.body.task.untilDateTime)
      : null;

    return await db.sequelize.transaction(async (t: any) => {
      if (dueDate === null)
        return res
          .status(500)
          .json({ title: 'task.invalidDate', msg: 'task.invalidDate' });

      let taskUsers: any[] = await getUsers(req, res);

      if (respondIfErrors(taskUsers, req.body.task.repeat, res)) return;

      let task = await db.Task.create(
        {
          homeId: res.locals.home.id,
          ownerId: req.user.id,
          name: req.body.task.name,
          shared: req.body.task.shared,
        },
        { transaction: t }
      );

      let taskOccurence: TaskOccurence = {
        taskId: task.id,
        Users: taskUsers,
        dueDate: dueDate,
        repeat: req.body.task.repeat,
        untilDate: untilDate,
        important: req.body.task.important,
      };
      let taskOccurences = await createTaskOccurences(taskOccurence, t);

      return res.json({
        title: 'tasks.created',
        msg: 'tasks.created',
        task: { ...task.dataValues, Occurences: taskOccurences },
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

// Deletes the task occurence with the specified id.
Tasks.delete('/:id', async (req: any, res: any) => {
  try {
    let tasks = await getTasks(req, res, 'all', req.params.id);
    if (tasks.length == 0)
      return res
        .status(404)
        .json({ title: 'task.notFound', msg: 'task.notFound' });

    let task = tasks[0];

    return await db.sequelize.transaction(async (t: any) => {
      // if deletedAt != null -> force delete
      var deletedAt =
        task.Occurences[0].deletedAt === null ? new Date().toUTCString() : null;
      let force = deletedAt === null;

      // Delete task occurence users
      if (force) {
        await db.UserTask.destroy(
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
