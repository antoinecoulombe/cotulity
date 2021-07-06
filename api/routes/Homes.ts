import express from 'express';

const Homes = express.Router();
const db = require('../db/models');

Homes.use('/', async (req: any, res) => {
  try {
    const homes = await req.user.getHomes();
    res.json({ homes });
  } catch (e) {
    res.json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Homes;
