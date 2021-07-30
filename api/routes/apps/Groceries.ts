import express from 'express';
import { validateHome, validateApp } from '../Apps';

const Groceries = express.Router();
const db = require('../../db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

Groceries.use(async (req: any, res, next) => {
  req.params.appname = 'groceries';
  validateApp(req, res, next);
});

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

export async function deleteGroceriesFromHome(
  home: any,
  transaction: any
): Promise<{ success: boolean; title: string; msg: string }> {
  try {
    await db.Grocery.destroy(
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

export default Groceries;
