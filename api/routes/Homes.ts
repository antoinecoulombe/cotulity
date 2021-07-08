import e from 'express';
import express from 'express';

const Homes = express.Router();
const db = require('../db/models');

Homes.get('/', async (req: any, res) => {
  try {
    const dbHomes = await req.user.getHomes({
      through: { where: { accepted: true } },
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

Homes.post('/create', async (req: any, res) => {
  try {
  } catch (e) {
    console.log(e);
    res.json({ title: 'request.error', msg: 'request.error' });
  }
});

Homes.post('/join/:refNumber', async (req: any, res) => {
  try {
    const userHome = await req.user.getHomes({
      where: { refNumber: req.params.refNumber },
      through: { paranoid: false },
    });

    if (userHome.length !== 0) {
      if (userHome[0].UserHome.deletedAt != null) {
        if (
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) <
          userHome[0].UserHome.deletedAt
        )
          return res.json({
            title: 'homes.requestAlreadyDenied',
            msg: 'homes.waitWeek',
          });
      } else {
        if (userHome[0].UserHome.accepted)
          return res.json({
            title: 'homes.alreadyInHome',
            msg: 'homes.alreadyInHome',
          });

        return res.json({
          title: 'homes.requestAlreadySent',
          msg: 'homes.requestAlreadySent',
        });
      }
    }

    const home = await db.Home.findOne({
      where: { refNumber: req.params.refNumber },
    });

    if (!home)
      return res.json({ title: 'homes.notFound', msg: 'homes.notFound' });

    db.Notification.create({
      typeId: 2,
      toId: home.ownerId,
      title: `{"translate":"homes.newRequest","format":["${home.name}"]}`,
      description: `{"translate":"homes.newRequest","format":["${req.user.firstname}","${home.name}"]}`,
    });

    if (userHome[0]?.UserHome?.deletedAt != null)
      userHome[0].UserHome.restore();
    else req.user.addHomes(home.id);

    res.json({ title: 'request.success' });
  } catch (e) {
    console.log(e);
    res.json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Homes;
