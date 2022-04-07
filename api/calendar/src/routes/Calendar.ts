import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';

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
Calendar.get('/', async (req: any, res: any) => {
  try {
    return res.status(501).json({
      title: 'request.notImplemented',
      msg: 'request.notImplemented',
      reached: 'calendar',
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
