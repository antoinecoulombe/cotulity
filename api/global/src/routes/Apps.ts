import express from 'express';
import { validateApp, validateHome } from '../../../shared/src/routes/Apps';

const Apps = express.Router();
const db = require('../../../shared/db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

// ########################################################
// ######################### GET ##########################
// ########################################################

// Validates application.
Apps.get('/:appname/', validateApp, (req, res) => {
  res.json({ title: 'request.authorized' });
});

// Validates application and home.
Apps.get('/:appname/:refnumber/', validateApp, validateHome, (req, res) => {
  res.json({ title: 'request.authorized' });
});

// Get all online apps.
Apps.get('/', async (req, res) => {
  try {
    const apps = await db.App.findAll({
      where: { online: true },
      attributes: ['id', 'priority', 'name', 'image'],
      order: db.sequelize.col('priority'),
    });
    res.json(apps);
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'apps.error', msg: 'request.reload' });
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

export default Apps;
