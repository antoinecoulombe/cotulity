// Imports
import express from 'express';
import bodyParser from 'body-parser';

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

import Homes from './routes/apps/Homes';
app.use('/homes', Homes);

import Settings from './routes/apps/Settings';
app.use('/settings', Settings);

// Generic Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({
    title: err.title || 'request.error',
    msg: err.msg || 'request.error',
    err: err.complete,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).send({
    title: 'request.notFound',
    msg: 'request.notFound',
  });
});

module.exports = app;
