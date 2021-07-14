import express from 'express';
import { validateHome, validateApp } from '../Apps';

const Finances = express.Router();
const db = require('../../db/models');

Finances.use(async (req: any, res, next) => {
  req.params.appname = 'finances';
  validateApp(req, res, next);
});

Finances.get('/', async (req: any, res, next) => {
  res.json({ finances: [] });
});

export default Finances;
