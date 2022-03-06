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

const getTasks = async (
  req: any,
  res: any,
  when: string,
  id?: boolean
): Promise<any> => {
  try {
    return await res.locals.home.getTasks({
      where: {
        id: id == undefined ? { [Op.ne]: 0 } : id,
        [Op.or]: [{ shared: true }, { ownerId: req.user.id }],
      },
      attributes: ['id', 'name', 'important', 'shared'],
      include: [
        {
          model: db.TaskOccurence,
          as: 'Occurences',
          where: {
            [Op.or]:
              when == 'all'
                ? [{ completedOn: null }, { completedOn: { [Op.ne]: null } }]
                : when == 'completed'
                ? [{ completedOn: { [Op.ne]: null } }]
                : [{ completedOn: null }],
          },
          attributes: ['id', 'dueDateTime', 'completedOn', 'deletedAt'],
          include: {
            model: db.User,
            as: 'Users',
            attributes: ['id', 'firstname', 'lastname'],
            include: { model: db.Image, attributes: ['url'] },
          },
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
    console.log((e as any).message);
    throw e;
  }
};

const toDate = (dateString: string): Date => {
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
    let untilMilliseconds = untilDate.getMilliseconds();

    while (dueDate.getMilliseconds() <= untilMilliseconds) {
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

      if (!valid || dueDate.getMilliseconds() > untilMilliseconds) break;

      occurences.push(dueDate.toUTCString());
    }
  }

  return occurences;
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

// TODO: TEST -> Modifies a task.
Tasks.put('/:id', async (req: any, res: any) => {
  try {
    let dueDate = toDate(req.body.task.dueDateTime);
    let untilDate = req.body.task.untilDateTime
      ? toDate(req.body.task.untilDateTime)
      : null;

    return await db.sequelize.transaction(async (t: any) => {
      let taskDb = await getTasks(req, res, 'all', req.params.id);
      if (!taskDb?.length)
        return res
          .status(404)
          .json({ title: 'task.notFound', msg: 'task.notFound' });

      if (
        ['none', 'day', 'week', 'twoweek', 'month'].includes(
          req.body.task.repeat
        )
      )
        return res
          .status(500)
          .json({ title: 'request.error', msg: 'request.error' });

      let task = taskDb[0];
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

      task.name = req.body.task.name;
      task.dueDateTime = dueDate;
      task.important = req.body.task.important;

      if (task.ownerId === req.user.id) task.shared = req.body.task.shared;

      let taskUsers: any[] = [];

      if (req.body.task.shared == false) taskUsers.push(req.user.id);
      else {
        taskUsers = members.filter(
          (u: any) =>
            req.body.task.Users.filter((uT: any) => uT.id === u.id).length > 0
        );
      }

      if (!taskUsers.length)
        return res
          .status(500)
          .json({ title: 'tasks.noUsers', msg: 'tasks.noUsers' });

      await db.TaskOccurence.destroy(
        {
          where: {
            taskId: task.id,
            dueDateTime: {
              [Op.gte]: db.sequelize.literal("NOW() - INTERVAL '7d'"),
            },
          },
          force: true,
        },
        { transaction: t }
      );
      await task.save({ transaction: t });

      let taskOccurence = { taskId: task.id, Users: taskUsers };

      let taskOccurences: any[] = getRepeatingDatesUntil(
        req.body.task.repeat,
        dueDate,
        untilDate
      ).map((o) => {
        return { ...taskOccurence, dueDateTime: o };
      });

      await db.TaskOccurence.bulkCreate(taskOccurences, { transaction: t });

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

    let taskOccurence = db.TaskOccurence.findOne({
      where: { id: req.params.occurenceId, taskId: tasks[0].id },
    });

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

// TODO: Restores a task.
Tasks.put('/:id/restore', async (req: any, res: any) => {
  try {
    let tasks = await getTasks(req, res, 'all', req.params.id);
    if (tasks.length == 0)
      return res
        .status(404)
        .json({ title: 'task.notFound', msg: 'task.notFound' });

    await tasks[0].restore();

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

// TODO: TEST -> Creates a new task.
Tasks.post('/', async (req: any, res: any) => {
  try {
    let dueDate = toDate(req.body.task.dueDateTime);
    let untilDate = req.body.task.untilDateTime
      ? toDate(req.body.task.untilDateTime)
      : null;

    return await db.sequelize.transaction(async (t: any) => {
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

      let taskUsers: any[] = [];

      if (req.body.task.shared == false) taskUsers.push(req.user.id);
      else {
        taskUsers = members.filter(
          (u: any) =>
            req.body.task.Users.filter((uT: any) => uT.id === u.id).length > 0
        );
      }

      if (!taskUsers.length)
        return res
          .status(500)
          .json({ title: 'request.error', msg: 'request.error' });

      if (
        ['none', 'day', 'week', 'twoweek', 'month'].includes(
          req.body.task.repeat
        )
      )
        return res
          .status(500)
          .json({ title: 'request.error', msg: 'request.error' });

      let task = await db.Task.create(
        {
          homeId: res.locals.home.id,
          ownerId: req.user.id,
          name: req.body.task.name,
          shared: req.body.task.shared,
          important: req.body.task.important,
        },
        { transaction: t }
      );

      let taskOccurence = { taskId: task.id, Users: taskUsers };

      let taskOccurences: any[] = getRepeatingDatesUntil(
        req.body.task.repeat,
        dueDate,
        untilDate
      ).map((o) => {
        return { ...taskOccurence, dueDateTime: o };
      });

      await db.TaskOccurence.bulkCreate(taskOccurences, { transaction: t });

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

// TODO: Deletes the task with the specified id.
Tasks.delete('/:id', async (req: any, res: any) => {
  try {
    let tasks = await getTasks(req, res, 'all', req.params.id);
    if (tasks.length == 0)
      return res
        .status(404)
        .json({ title: 'task.notFound', msg: 'task.notFound' });

    let task = tasks[0];

    var deletedAt = null;
    if (task.deletedAt == null) {
      await task.destroy();
      deletedAt = task.deletedAt;
    } else {
      await task.destroy({ force: true });
    }

    res.json({
      title: 'request.success',
      msg: 'request.success',
      deletedAt: deletedAt,
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Tasks;
