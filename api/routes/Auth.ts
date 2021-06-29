require('dotenv').config();

import express from 'express';

const Router = express.Router();

const db = require('../db/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

Router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    let user = await db.User.findOne({ where: { email: email } });

    if (!user) {
      res.status(401).json({
        title: 'Login failed',
        msg: 'Incorrect username or password.',
      });
    }

    if (bcrypt.compareSync(password, user.password)) {
      let payload = { id: user.id };

      let token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      res.json({ msg: 'User authorized', token: token });
    } else {
      res.status(401).json({
        title: 'Login failed',
        msg: 'Incorrect username or password.',
      });
    }
  }
});

export default Router;
