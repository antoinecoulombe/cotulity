import express from 'express';
import { validateHome, validateApp } from '../Apps';

const Tasks = express.Router();
const db = require('../../db/models');
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

async function getTasks(req: any, res: any, when: string, id?: boolean) {
  try {
    return await res.locals.home.getTasks({
      where:
        when == 'all'
          ? {
              id: id == undefined ? { [Op.ne]: 0 } : id,
              [Op.or]: [{ shared: true }, { ownerId: req.user.id }],
            }
          : {
              id: id == undefined ? { [Op.ne]: 0 } : id,
              completedOn: when == 'completed' ? { [Op.ne]: null } : null,
              [Op.or]: [{ shared: true }, { ownerId: req.user.id }],
            },
      attributes: [
        'id',
        'name',
        'dueDateTime',
        'important',
        'shared',
        'completedOn',
        'deletedAt',
      ],
      include: [
        {
          model: db.User,
          as: 'Users',
          attributes: ['id', 'firstname', 'lastname'],
          include: { model: db.Image, attributes: ['url'] },
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
  } catch (error) {
    throw error;
  }
}

// ########################################################
// ######################### GET ##########################
// ########################################################

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
    console.log(error);
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
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// Modifies a task.
Tasks.put('/:id', async (req: any, res: any) => {
  try {
    let task = getTasks(req, res, 'all', req.params.id);
    // if not shared
    //    remove all userTasks with :id
    //    add ownerId to userTasks with :id
    res.json({ title: 'request.success', msg: 'request.success' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// Completes a task.
Tasks.put('/:id/do', async (req: any, res: any) => {
  try {
    let tasks = await getTasks(req, res, 'upcoming', req.params.id);
    if (tasks.length == 0)
      return res
        .status(404)
        .json({ title: 'request.notFound', msg: 'request.notFound' });

    tasks[0].completedOn = new Date();
    await tasks[0].save();

    res.json({
      title: 'request.success',
      msg: 'request.success',
      completedOn: tasks[0].completedOn,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// Uncompletes a task.
Tasks.put('/:id/undo', async (req: any, res: any) => {
  try {
    let tasks = await getTasks(req, res, 'completed', req.params.id);
    if (tasks.length == 0)
      return res
        .status(404)
        .json({ title: 'request.notFound', msg: 'request.notFound' });

    tasks[0].completedOn = null;
    await tasks[0].save();

    res.json({
      title: 'request.success',
      msg: 'request.success',
      completedOn: tasks[0].completedOn,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### POST #########################
// ########################################################

// Creates a new task.
Tasks.post('/', async (req: any, res: any) => {
  try {
    // if not shared
    //    add ownerId to userTasks with :id
    res.json({ title: 'request.success', msg: 'request.success' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

// Deletes the task with the specified id.
Tasks.delete('/:id', async (req: any, res: any) => {
  try {
    let tasks = await getTasks(req, res, 'all', req.params.id);
    if (tasks.length == 0)
      return res
        .status(404)
        .json({ title: 'request.notFound', msg: 'request.notFound' });

    var deletedAt = null;
    if (tasks[0].deletedAt == null) {
      await tasks[0].destroy();
      deletedAt = tasks[0].deletedAt;
    } else await tasks[0].destroy({ force: true });

    res.json({
      title: 'request.success',
      msg: 'request.success',
      deletedAt: deletedAt,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Tasks;
