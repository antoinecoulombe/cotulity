import express from 'express';

const passport = require('passport');
require('../config/passport');

const AuthMiddleware = express.Router();

AuthMiddleware.use(async (req: any, res, next) => {
  const publicPaths = ['/auth/login', '/users/register'];
  const publicPathStarts = ['/homes/public', '/images/public', '/users/public'];
  if (
    publicPaths.includes(req.path) ||
    publicPathStarts.filter((p: string) => req.path.startsWith(p)).length > 0
  )
    return next();

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
