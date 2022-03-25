import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';

const Transfers = express.Router();
const db = require('../../../shared/db/models');
const { Op } = require('sequelize');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

Transfers.use(async (req: any, res, next) => {
  req.params.appname = 'accounts';
  validateApp(req, res, next);
});

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

// ########################################################
// ######################### GET ##########################
// ########################################################

// Get all transfers
Transfers.get('/', async (req: any, res: any) => {
  try {
    // TODO SECOND
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

// Modify a transfer
Transfers.put('/:id', async (req: any, res: any) => {
  try {
    // TODO THIRD
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

// Create a new transfer
Transfers.post('/', async (req: any, res: any) => {
  try {
    // TODO FIRST
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

// Delete a transfer
Transfers.delete('/:id', async (req: any, res: any) => {
  try {
    // TODO FOURTH
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

export default Transfers;
