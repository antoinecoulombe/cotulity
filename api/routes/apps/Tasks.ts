import express from 'express';
import { validateHome, validateApp } from '../Apps';

const Tasks = express.Router();
const db = require('../../db/models');

Tasks.use(async (req: any, res, next) => {
  req.params.appname = 'tasks';
  validateApp(req, res, next);
});

Tasks.get('/', async (req: any, res, next) => {
  res.json({ tasks: [] });
});

export default Tasks;
