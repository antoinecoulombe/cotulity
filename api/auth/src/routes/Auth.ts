import express from 'express';
// import { validateApp } from '../../../shared/src/routes/Apps';

const Auth = express.Router();
const db = require('../../../db/models');

const passport = require('passport');
require('../../config/passport');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

// ########################################################
// ######################### GET ##########################
// ########################################################

Auth.get('/', async (req: any, res: any) => {
  const publicPaths = ['/auth/login', '/users/register'];
  const publicPathStarts = ['/homes/public', '/images/public', '/users/public'];
  if (
    publicPaths.includes(req.path) ||
    publicPathStarts.filter((p: string) => req.path.startsWith(p)).length
  )
    return res.json({ title: 'request.success', msg: 'request.success' });

  passport.authenticate(
    'jwt',
    {
      session: false,
    },
    function (err: any, user: any, info: any) {
      if (err)
        return res
          .status(403)
          .json({ title: 'request.denied', msg: 'request.unauthorized' });

      if (!user) {
        return res.status(403).json({
          title: 'request.denied',
          msg: 'request.unauthorized',
        });
      } else
        return res.json({ title: 'request.success', msg: 'request.success' });
    }
  )(req, res);
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// ########################################################
// ######################### POST #########################
// ########################################################

// ########################################################
// ######################## DELETE ########################
// ########################################################

export default Auth;
