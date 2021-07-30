import express from 'express';
import { validateHome, validateApp } from '../Apps';

const Tasks = express.Router();
const db = require('../../db/models');

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

export async function deleteTasksFromHome(
  home: any,
  transaction: any
): Promise<{ success: boolean; title: string; msg: string }> {
  try {
    await db.Task.destroy(
      { where: { homeId: home.id }, force: true },
      { transaction: transaction }
    );
    return { success: true, title: 'request.success', msg: 'request.success' };
  } catch (error) {
    console.log(error);
    return { success: false, title: 'request.error', msg: 'request.error' };
  }
}

// ########################################################
// ######################### GET ##########################
// ########################################################

// ########################################################
// ######################### PUT ##########################
// ########################################################

// ########################################################
// ######################### POST #########################
// ########################################################

// ########################################################
// ######################## DELETE ########################
// ########################################################

export default Tasks;
