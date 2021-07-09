import express from 'express';
import { all } from 'sequelize/types/lib/operators';

const Homes = express.Router();
const db = require('../db/models');

Homes.get('/:option?', async (req: any, res) => {
  try {
    const getAll: boolean = req.params.option === 'all';
    const dbHomes = await req.user.getHomes({
      through: { where: { accepted: getAll ? false : true } },
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
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

Homes.post('/create/:homeName', async (req: any, res) => {
  try {
    if (!req.params.homeName)
      return res.status(500).json({ title: '', msg: '' });

    const home = await db.sequelize.transaction(async (t: any) => {
      const refNumberDigits = 6;
      let refNumber;

      do {
        refNumber = Math.random()
          .toString()
          .slice(2, 2 + refNumberDigits);
      } while (
        (await db.Home.findOne({ where: { refNumber: refNumber } })) != null
      );

      const home = await db.Home.create(
        {
          refNumber: refNumber,
          name: req.params.homeName,
          ownerId: req.user.id,
        },
        { transaction: t }
      );

      await db.UserHome.create(
        {
          userId: req.user.id,
          homeId: home.id,
          accepted: 1,
        },
        { transaction: t }
      );

      return home;
    });

    res.json({
      title: 'newHome.created',
      msg: 'newHome.created',
      refNumber: home.refNumber,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

Homes.post('/join/:refNumber', async (req: any, res) => {
  try {
    console.log(req.params.refNumber);
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
          return res.status(500).json({
            title: 'homes.requestAlreadyDenied',
            msg: 'homes.waitWeek',
          });
      } else {
        if (userHome[0].UserHome.accepted)
          return res.status(500).json({
            title: 'homes.couldNotJoin',
            msg: 'homes.alreadyInHome',
          });

        return res.status(500).json({
          title: 'homes.couldNotJoin',
          msg: 'homes.requestAlreadySent',
        });
      }
    }

    const home = await db.Home.findOne({
      where: { refNumber: req.params.refNumber },
    });

    if (!home)
      return res
        .status(500)
        .json({ title: 'homes.notFound', msg: 'homes.notFound' });

    await db.sequelize.transaction(async (t: any) => {
      db.Notification.create(
        {
          typeId: 2,
          toId: home.ownerId,
          title: `{"translate":"homes.newRequest","format":["${home.name}"]}`,
          description: `{"translate":"homes.newRequest","format":["${req.user.firstname}","${home.name}"]}`,
        },
        { transaction: t }
      );

      if (userHome[0]?.UserHome?.deletedAt != null)
        return userHome[0].UserHome.restore({}, { transaction: t });
      else return req.user.addHomes(home.id, { transaction: t });
    });

    res.json({ title: 'homes.requestSent', msg: 'homes.requestSent' });
  } catch (e) {
    console.log(e);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Homes;
