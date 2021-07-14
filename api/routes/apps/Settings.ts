import express from 'express';
import { validateApp } from '../Apps';

const Settings = express.Router();
const db = require('../../db/models');

Settings.use(async (req: any, res, next) => {
  req.params.appname = 'settings';
  validateApp(req, res, next);
});

Settings.get('/', async (req: any, res, next) => {
  res.json({ settings: [] });
});

export default Settings;
