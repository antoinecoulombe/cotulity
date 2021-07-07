import express from 'express';

const Homes = express.Router();
const db = require('../db/models');

Homes.use('/', async (req: any, res) => {
  try {
    const dbHomes = await req.user.getHomes({
      attributes: ['id', 'refNumber', 'name'],
    });

    res.json({
      homes: JSON.parse(
        JSON.stringify(dbHomes, [
          'id',
          'refNumber',
          'name',
          'UserHome',
          'nickname',
        ])
      ),
    });
  } catch (e) {
    console.log(e);
    res.json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Homes;
