import express = require('express');
import jwtDecode from 'jwt-decode';

const passport = require('passport');
require('../config/passport');

const AuthMiddleware = express.Router();

AuthMiddleware.use(async (req: any, res, next) => {
  const publicPaths = ['/auth/login', '/users/register'];
  if (publicPaths.includes(req.path)) return next();

  passport.authenticate(
    'jwt',
    {
      session: false,
    },
    function (err: any, user: any, info: any) {
      if (err) return next(err);

      if (!user) {
        return next({
          title: 'Access Denied',
          msg: "You don't have the required permissions to access the requested ressource.",
        });
      } else return next();
    }
  )(req, res, next);
});

export default AuthMiddleware;
