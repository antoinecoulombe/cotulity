import express from 'express';

const Notifications = express.Router();

const db = require('../db/models');

Notifications.get('/', async (req, res) => {
  res.json({ msg: 'notification' });
});

export default Notifications;
