import express from 'express';
// import { validateApp } from '../../../shared/src/routes/Apps';

const Finances = express.Router();
const db = require('../../../db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// TODO: uncomment this before adding routes
// Finances.use(async (req: any, res, next) => {
//   req.params.appname = 'finances';
//   validateApp(req, res, next);
// });

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

export default Finances;