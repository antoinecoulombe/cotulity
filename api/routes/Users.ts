import express from 'express';

const Users = express.Router();

const db = require('../db/models');
const bcrypt = require('bcryptjs');

Users.get('/', async (req, res) => {
  console.log('USERS INDEX');
  try {
    const users = await db.User.findAll();
    res.json({ users });
  } catch (e) {
    res.json({ error: e });
  }
});

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
      title: 'Registration completed',
      msg: 'Welcome aboard!',
    });
  } catch (e) {
    let error;
    if (e.name == 'SequelizeUniqueConstraintError')
      error = { title: 'Registration Failed', msg: e.errors[0].message };

    res
      .status(500)
      .json(error || { title: 'An error occured', msg: 'Please try again.' });
  }
});

export default Users;
