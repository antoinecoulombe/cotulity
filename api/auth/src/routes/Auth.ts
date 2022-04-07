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

/**
 * Authenticates a user.
 */
Auth.get('/', async (req: any, res: any) => {
  try {
    passport.authenticate(
      'jwt',
      {
        session: false,
      },
      function (err: any, user: any, info: any) {
        // Check if an error was received from authentication
        if (err)
          return res
            .status(401)
            .json({ title: 'request.denied', msg: 'request.unauthorized' });

        // Check if a user was received from authentication
        if (!user) {
          return res.status(401).json({
            title: 'request.denied',
            msg: 'request.unauthorized',
          });
        }

        // Check if the user has a verified email address
        if (!user.emailVerifiedAt)
          return res.status(401).json({
            title: 'user.notVerified',
            msg: 'user.mustVerifyNoEmail',
          });

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
