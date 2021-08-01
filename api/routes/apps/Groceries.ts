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

// ########################################################
// ######################### GET ##########################
// ########################################################

Groceries.get('/:refnumber', validateHome, async (req: any, res: any) => {
  try {
    // TODO: get all groceries associated to home
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// ########################################################
// ######################### POST #########################
// ########################################################

Groceries.post('/:refnumber', validateHome, async (req: any, res: any) => {
  try {
    // TODO: add grocerie to home
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

Groceries.delete('/:refnumber', validateHome, async (req: any, res: any) => {
  try {
    // TODO: delete grocerie from home
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Groceries;
