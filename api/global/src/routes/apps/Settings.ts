import express from 'express';
import { validateApp } from '../Apps';

const Settings = express.Router();
const db = require('../../../db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// TODO: uncomment this before adding routes
// Settings.use(async (req: any, res, next) => {
//   req.params.appname = 'settings';
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

export default Settings;