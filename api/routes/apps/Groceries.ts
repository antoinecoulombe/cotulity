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
