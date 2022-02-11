const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';

const Router = express.Router();

const db = require('../../db/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

      if (bcrypt.compareSync(password, user.password)) {
        let payload = { id: user.id };

        let token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: '24h',
        });

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
    res.status(500).json({ msg: (error as any).message });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

export default Router;
