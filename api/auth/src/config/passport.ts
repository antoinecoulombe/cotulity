require('dotenv').config({
  path: require('path').resolve(__dirname, '../../../shared/.env'),
});

var db = require('../../../shared/db/models');
var passport = require('passport');
var passportJWT = require('passport-jwt');

passport.use(
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
      passReqToCallback: true,
    },
    async (req: any, jwt_payload: any, next: any) => {
      if (!jwt_payload.id) next(null, false);

      let user = await db.User.findOne({
        where: { id: jwt_payload.id },
      });

      if (user) {
        req.user = user;
        next(null, user);
      } else next(null, false);
    }
  )
);
