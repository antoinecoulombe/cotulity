import express from 'express';

const Auth = express.Router();

const passport = require('passport');
require('../config/passport');

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
  try {
    const url = req.get('x-original-uri'); // req.path
    const publicPaths = ['/auth/login', '/users/register'];
    const publicPathStarts = [
      '/homes/public',
      '/images/public',
      '/users/public',
    ];
    if (
      publicPaths.includes(url) ||
      publicPathStarts.filter((p: string) => url.startsWith(p)).length
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
            .status(401)
            .json({ title: 'request.denied', msg: 'request.unauthorized' });

        if (!user) {
          return res.status(401).json({
            title: 'request.denied',
            msg: 'request.unauthorized',
          });
        } else
          return res.json({ title: 'request.success', msg: 'request.success' });
      }
    )(req, res);
  } catch (e) {
    return res
      .status(401)
      .json({ title: 'request.denied', msg: 'request.unauthorized' });
  }
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
