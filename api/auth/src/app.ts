import express from 'express';
import bodyParser from 'body-parser';

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

// ############################## Routes ###############################

import Auth from './routes/Auth';
app.use('/auth', Auth);

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
  res.status(err.statusCode || 500).json({
    title: err.title || 'request.error',
    msg: err.msg || 'request.error',
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
