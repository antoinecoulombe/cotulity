import express from 'express';
import GeneralMiddleware from '../middlewares/GeneralMiddleware';

const Users = express.Router();

const db = require('../db/models');
const bcrypt = require('bcryptjs');

// Users.use(GeneralMiddleware);

Users.get('/', async (req, res) => {
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
    res.json({ user, msg: 'User created successfully.' });
  } catch (e) {
    res.json({ error: e, pwd: pwdHash });
  }
});

export default Users;
