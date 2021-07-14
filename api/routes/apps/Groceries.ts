import express from 'express';
import { validateHome, validateApp } from '../Apps';

const Groceries = express.Router();
const db = require('../../db/models');

Groceries.use(async (req: any, res, next) => {
  req.params.appname = 'groceries';
  validateApp(req, res, next);
});

Groceries.get('/', async (req: any, res, next) => {
  res.json({ groceries: [] });
});

export default Groceries;
