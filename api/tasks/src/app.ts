// Imports
import express from 'express';
import bodyParser from 'body-parser';
import { validateHome } from '../../shared/src/routes/Apps';
import { AddUserToRequest } from '../../shared/src/middlewares/AuthMiddleware';

// Requires
var cors = require('cors');

// Express
const app = express();

// Environment
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Express Settings
app.set('port', process.env.PORT);

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({ extended: true, parameterLimit: 100, limit: '100mb' })
);

// Middlewares

app.use(async (req: any, res: any, next) => {
  await AddUserToRequest(req);
  next();
});

// Routes

import Tasks from './routes/Tasks';
app.use('/tasks/:refnumber', validateHome, Tasks);

// Ping Handler
app.get('/', (req: any, res: any) =>
  res.json({ title: 'apps.ping', msg: 'apps.pingable' })
);

// Generic Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  /* istanbul ignore next */
  res.status(err.statusCode || 500).json({
    title: err.title || 'request.error',
    msg: err.msg || 'request.error',
  });
});

// 404 Handler
app.use((req, res) => {
  /* istanbul ignore next */
  res.status(404).send({
    title: 'request.notFound',
    msg: 'request.notFound',
  });
});

module.exports = app;
