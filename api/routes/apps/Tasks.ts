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

// ########################################################
// ######################### GET ##########################
// ########################################################

// Get all upcoming tasks
Tasks.get('/upcoming', async (req: any, res: any) => {
  try {
    const tasks = await res.locals.home.getTasks({
      where: {
        completedOn: null,
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
    });
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// Creates a new task.
Tasks.put('/:id', async (req: any, res: any) => {
  try {
    // if not shared
    //    remove all userTasks with :id
    //    add ownerId to userTasks with :id
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

// Delets the task with the specified id.
Tasks.delete('/:id', async (req: any, res: any) => {
  try {
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Tasks;
