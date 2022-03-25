import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';

const Expenses = express.Router();
const db = require('../../../shared/db/models');
const { Op } = require('sequelize');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

Expenses.use(async (req: any, res, next) => {
  req.params.appname = 'accounts';
  validateApp(req, res, next);
});

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

// ########################################################
// ######################### GET ##########################
// ########################################################

// Get all expenses
Expenses.get('/', async (req: any, res: any) => {
  try {
    return res.status(501).json({
      title: 'request.notImplemented',
      msg: 'request.notImplemented',
      reached: 'accounts',
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// Modify an expense
Expenses.put('/:id', async (req: any, res: any) => {
  try {
    return res.status(501).json({
      title: 'request.notImplemented',
      msg: 'request.notImplemented',
      reached: 'accounts',
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### POST #########################
// ########################################################

// Create a new expense
Expenses.post('/', async (req: any, res: any) => {
  try {
    return res.status(501).json({
      title: 'request.notImplemented',
      msg: 'request.notImplemented',
      reached: 'accounts',
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

// Delete an expense
Expenses.delete('/:id', async (req: any, res: any) => {
  try {
    return res.status(501).json({
      title: 'request.notImplemented',
      msg: 'request.notImplemented',
      reached: 'accounts',
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});
export default Expenses;
