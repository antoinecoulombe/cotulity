import express from 'express';
import GeneralMiddleware from '../middlewares/GeneralMiddleware';

const Users = express.Router();

const db = require('../db/models');

// Users.use(GeneralMiddleware);

Users.get('/', async (req, res) => {
  try {
    const users = await db.User.findAll();
    res.json({ users });
  } catch (e) {
    res.json({ msg: e.message });
  }
});

Users.post('/register', async (req, res) => {
  try {
    const { email, password, firstname, lastname, phone } = req.body;
    const user = await db.User.create({
      email,
      password,
      firstname,
      lastname,
      phone,
    });
    res.json({ user, msg: 'User created successfully.' });
  } catch (e) {
    res.json({ msg: e.message });
  }
});

export default Users;
