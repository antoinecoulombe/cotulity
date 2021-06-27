// Requires
const passport = require('passport');

require('./config/passport');

// Imports
import express from 'express';
import bodyParser from 'body-parser';
import jwtDecode from 'jwt-decode';

// Express
const app = express();

// Express Settings
app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
import Users from './routes/Users';
app.use('/users', Users);

import Auth from './routes/Auth';
app.use('/auth', Auth);

// Express Start
app.listen(app.get('port'), () => {
  return console.log(`server is listening on ${app.get('port')}`);
});

// protected route
app.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      msg: 'Congrats! You are seeing this because you are authorized',
      id: jwtDecode(req.get('Authorization') as string),
    });
  }
);
