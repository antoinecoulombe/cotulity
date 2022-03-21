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
  if (await AddUserToRequest(req)) next();
  else next({ title: 'request.error', msg: 'request.error' });
});

// Routes

import Accounts from './routes/Accounts';
app.use('/accounts/:refnumber', validateHome, Accounts);

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
