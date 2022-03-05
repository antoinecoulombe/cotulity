// Imports
import express from 'express';
import bodyParser from 'body-parser';
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
import Auth from './routes/Auth';
app.use('/auth', Auth);

import Users from './routes/Users';
app.use('/users', Users);

import Notifications from './routes/Notifications';
app.use('/notifications', Notifications);

import Images from './routes/Images';
app.use('/images', Images);

import Apps from './routes/Apps';
app.use('/apps', Apps);

import Settings from './routes/Settings';
app.use('/settings', Settings);

// Generic Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  /* istanbul ignore next */
  res.status(500).json({
    title: 'request.error',
    msg: 'request.error',
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
