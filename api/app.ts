// Imports
import express from 'express';
import bodyParser from 'body-parser';

// Express
const app = express();

// Express Settings
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middlewares
import AuthMiddleware from './middlewares/AuthMiddleware';
app.use(AuthMiddleware);

// Routes
import Users from './routes/Users';
app.use('/users', Users);

import Auth from './routes/Auth';
app.use('/auth', Auth);

// Express Start
app.listen(app.get('port'), () => {
  return console.log(`server is listening on ${app.get('port')}`);
});

// Generic Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).json({
    title: err.title || 'An error occured',
    msg: err.msg || 'Please try again.',
    err: err.complete,
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).send({
    title: '404 - Not found',
    msg: "Our robots can't find what you are looking for.",
  });
});
