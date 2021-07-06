// Imports
import express from 'express';
import bodyParser from 'body-parser';

// CORS
var cors = require('cors');

// Express
const app = express();

// Express Settings
app.set('port', process.env.PORT || 3000);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middlewares
import AuthMiddleware from './middlewares/AuthMiddleware';
app.use(AuthMiddleware);

// Routes
import Auth from './routes/Auth';
app.use('/auth', Auth);

import Users from './routes/Users';
app.use('/users', Users);

import Notifications from './routes/Notifications';
app.use('/notifications', Notifications);

import Apps from './routes/Apps';
app.use('/apps', Apps);

import Homes from './routes/Homes';
app.use('/homes', Homes);

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

// Express Start
app.listen(app.get('port'), () => {
  return console.log(`server is listening on ${app.get('port')}`);
});
