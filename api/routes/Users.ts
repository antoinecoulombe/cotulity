import express from 'express';

const Users = express.Router();

const db = require('../db/models');
const bcrypt = require('bcryptjs');

Users.post('/register', async (req, res) => {
  let pwdHash = null;
  try {
    const { email, firstname, lastname, phone } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.password, salt);

    const user = await db.User.create({
      email,
      password,
      firstname,
      lastname,
      phone,
    });

    res.json({
      title: 'register.success',
      msg: 'register.success',
    });
  } catch (e) {
    res.status(500).json({
      title: e.errors[0] ? 'register.error' : 'request.error',
      msg: e.errors[0]?.message ?? 'request.error',
      input: e.errors[0]?.path ?? null,
    });
  }
});

export default Users;
