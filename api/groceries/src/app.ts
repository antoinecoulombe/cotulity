import express from 'express';
import bodyParser from 'body-parser';
import { validateHome } from '../../shared/src/routes/Apps';
import { AddUserToRequest } from '../../shared/src/middlewares/AuthMiddleware';

var cors = require('cors');

// ########################### Environment #############################

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ############################# Express ###############################

const app = express();
app.set('port', process.env.PORT);

app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({ extended: true, parameterLimit: 100, limit: '100mb' })
);

// ############################ Middlewares ############################

/**
 * Adds user to request.
 */
app.use(async (req: any, res: any, next) => {
  await AddUserToRequest(req);
  next();
});

// ############################## Routes ###############################

import Groceries from './routes/Groceries';
app.use('/groceries/:refnumber', validateHome, Groceries);

// ############################# Handlers ##############################

/**
 * Ping Handler
 */
app.get('/', (req: any, res: any) =>
  res.json({ title: 'apps.ping', msg: 'apps.pingable' })
);

/**
 * Generic Error Handler
 */
app.use((err: any, req: any, res: any, next: any) => {
  /* istanbul ignore next */
  res.status(500).json({
    title: 'request.error',
    msg: 'request.error',
  });
});

/**
 * 404 Handler
 */
app.use((req, res) => {
  /* istanbul ignore next */
  res.status(404).send({
    title: 'request.notFound',
    msg: 'request.notFound',
  });
});

module.exports = app;
