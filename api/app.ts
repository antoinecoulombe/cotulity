require('dotenv').config();
const db = require('./db/models');

import express from 'express';
import Users from './routes/Users';
import bodyParser from 'body-parser';
import jwtDecode from 'jwt-decode';

const app = express();

// authentication
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportJWT = require('passport-jwt');

let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;
let jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'TO_CHANGE',
};

// lets create our strategy for web token
let strategy = new JwtStrategy(
  jwtOptions,
  async (jwt_payload: any, next: any) => {
    let user = await db.User.findOne({
      where: { id: jwt_payload.id },
    });
    next(null, user ? user : false);
  }
);

passport.use(strategy);

app.set('port', process.env.PORT || 3000);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/users', Users);

app.listen(app.get('port'), () => {
  return console.log(`server is listening on ${app.get('port')}`);
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    let user = await db.User.findOne({ where: { email: email } });
    if (!user) {
      res.status(401).json({ msg: 'User not found', user });
    }
    if (user.password === password) {
      let payload = { id: user.id };
      let token = jwt.sign(payload, jwtOptions.secretOrKey, {
        expiresIn: '1h',
      });
      res.json({ msg: 'ok', token: token });
    } else {
      res.status(401).json({ msg: 'The entered password is incorrect' });
    }
  }
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
