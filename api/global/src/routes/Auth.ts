const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../../shared/.env'),
});

import express from 'express';
import {
  email as emailInfo,
  sendEmail,
} from '../../../shared/src/routes/Email';
import * as Global from '../../../shared/src/routes/Global';

const Router = express.Router();

const db = require('../../../shared/db/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

// ########################################################
// ######################### GET ##########################
// ########################################################

// ########################################################
// ######################### PUT ##########################
// ########################################################

// ########################################################
// ######################### POST #########################
// ########################################################

// Log in a user.
Router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      let user = await db.User.findOne({ where: { email: email } });

      if (!user) {
        return res.status(404).json({
          title: 'login.error',
          msg: 'login.error',
        });
      }

      // If passwords match
      if (bcrypt.compareSync(password, user.password)) {
        let payload = { id: user.id };

        let token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: '24h',
        });

        // If user is not verified
        if (!user.emailVerifiedAt) {
          var yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);

          // Get number of verification emails sent in the last day
          let count = await db.VerificationEmail.count({
            where: {
              userId: user.id,
              [Op.and]: [
                { createdAt: { [Op.gte]: yesterday } },
                { createdAt: { [Op.lte]: new Date() } },
              ],
            },
          });

          if (count >= 5)
            return res.status(501).json({
              title: 'user.notVerified',
              msg: 'user.mustVerifyNoEmail',
            });

          const emailToken = Global.createToken(4);
          let verifEmail = await db.VerificationEmail.create({
            userId: user.id,
            token: emailToken,
          });

          const emailHTML = await Global.readHTML(
            __dirname + '/_html/verifyEmail.html'
          );
          if (!emailHTML) throw 'Could not read HTML.';

          const formattedEmailHTML = Global.format(emailHTML, [emailToken]);

          const mailRes = await sendEmail({
            from: emailInfo.sender,
            to: req.body.email,
            subject: `Verify Your Cotulity Account`,
            html: formattedEmailHTML,
          });

          if (!mailRes.success) {
            await verifEmail.destroy({ force: true });
            return res
              .status(500)
              .json({ title: 'email.didNotSend', msg: 'email.didNotSend' });
          }

          return res
            .status(501)
            .json({ title: 'user.notVerified', msg: 'user.mustVerify' });
        }

        res.json({
          title: 'login.success',
          msg: 'login.success',
          token: token,
          userId: user.id,
        });
      } else {
        res.status(401).json({
          title: 'login.error',
          msg: 'login.error',
        });
      }
    } else {
      res.status(500).json({
        title: 'login.error',
        msg: 'login.error',
      });
    }
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({
      title: 'request.error',
      msg: 'request.error',
    });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

export default Router;
