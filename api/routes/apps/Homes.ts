import express, { request } from 'express';
import { validateHome, validateApp } from '../Apps';

const Homes = express.Router();
const db = require('../../db/models');

// Middlewares
Homes.use(async (req: any, res, next) => {
  req.params.appname = 'homes';
  validateApp(req, res, next);
});

// ######################## Getters / Globals ########################

async function getHomes(req: any, res: any, all: boolean) {
  try {
    const dbHomes = await req.user.getHomes({
      group: ['Home.id'],
      through: !all ? { where: { accepted: true } } : {},
      attributes: [
        'id',
        'ownerId',
        'refNumber',
        'name',
        [
          db.sequelize.fn('COUNT', db.sequelize.col('Members.id')),
          'memberCount',
        ],
      ],
      include: [
        {
          model: db.User,
          as: 'Members',
          through: {
            where: { accepted: true },
          },
        },
      ],
      order: [
        'name',
        [db.sequelize.fn('COUNT', db.sequelize.col('Members.id')), 'DESC'],
      ],
    });

    res.json({
      homes: JSON.parse(
        JSON.stringify(dbHomes, [
          'id',
          'ownerId',
          'refNumber',
          'name',
          'memberCount',
          'UserHome',
          'nickname',
          'accepted',
        ])
      ),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
}

async function denyIfNotOwner(req: any, res: any) {
  if (res.locals.home.ownerId !== req.user.id) {
    res
      .status(403)
      .json({ title: 'request.denied', msg: 'request.unauthorized' });
    return true;
  }
  return false;
}

Homes.get('/', async (req: any, res) => {
  getHomes(req, res, true);
});

Homes.get('/accepted', async (req: any, res) => {
  getHomes(req, res, false);
});

Homes.get('/:refnumber', validateHome, async (req: any, res: any) => {
  try {
    if (await denyIfNotOwner(req, res)) return;

    const home = await req.user.getHomes({
      where: { refNumber: res.locals.home.refNumber },
      attributes: ['ownerId', 'refNumber', 'name'],
      include: [
        {
          model: db.User,
          as: 'Members',
          attributes: ['id', 'firstname', 'lastname', 'image'],
        },
      ],
    });

    res.json(home[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ######################## Join/Create (homes/new) ########################

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
  } catch (error) {
    console.log(error);
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ######################## Edit ########################

Homes.delete(
  '/:refnumber/members/remove/:id',
  validateHome,
  async (req: any, res: any) => {
    try {
      if (await denyIfNotOwner(req, res)) return;
      if (req.params.id == res.locals.home.ownerId)
        return res
          .status(403)
          .json({ title: 'request.denied', msg: 'request.unauthorized' });

      let userHome = await db.UserHome.findOne({
        where: { userId: req.params.id, homeId: res.locals.home.id },
      });

      if (!userHome)
        return res
          .status(404)
          .json({ title: 'request.notFound', msg: 'request.notFound' });

      await userHome.destroy({ force: true });

      res.json({ title: 'request.success', msg: 'request.success' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
  }
);

Homes.post(
  '/:refnumber/request/:action/:id',
  validateHome,
  async (req: any, res: any) => {
    try {
      const actions = ['accept', 'reject'];
      const action = req.params.action;
      if (!action || !actions.includes(action))
        return res
          .status(404)
          .json({ title: 'request.notFound', msg: 'request.notFound' });

      if (await denyIfNotOwner(req, res)) return;

      return await db.sequelize.transaction(async (t: any) => {
        let userHome = await db.UserHome.findOne({
          where: { userId: req.params.id, homeId: res.locals.home.id },
        });

        if (!userHome)
          return res
            .status(404)
            .json({ title: 'request.notFound', msg: 'request.notFound' });

        if (action == 'accept') {
          userHome.accepted = true;
          await userHome.save({ transaction: t });
        } else if (action == 'reject') {
          await userHome.destroy({ transaction: t });
        }

        await db.Notification.create(
          {
            typeId: action == 'accept' ? 2 : 3,
            toId: req.params.id,
            title: `{"translate":"homes.${
              action == 'accept' ? 'requestAccepted' : 'requestDenied'
            }","format":["${res.locals.home.name}"]}`,
            description: `{"translate":"homes.${
              action == 'accept' ? 'requestAccepted' : 'requestDenied'
            }","format":["${res.locals.home.name}"]}`,
          },
          { transaction: t }
        );

        return res.json({ title: 'request.success', msg: 'request.success' });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
  }
);

// ######################## Home management ########################

Homes.delete('/:refnumber/delete', validateHome, async (req: any, res: any) => {
  try {
    if (await denyIfNotOwner(req, res)) return;
    res.locals.home.destroy();

    res.json({ title: 'homes.homeDeleted', msg: 'homes.homeDeleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

Homes.delete('/:refnumber/quit', validateHome, async (req: any, res: any) => {
  try {
    res.locals.home.UserHome.destroy({ force: true });
    res.json({ title: 'homes.homeLeft', msg: 'homes.homeLeft' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

Homes.post('/:refnumber/rename', validateHome, async (req: any, res: any) => {
  try {
    const nickname = req.body.nickname;
    let home = res.locals.home;

    if (home.ownerId === req.user.id) {
      if (!nickname || nickname.length == 0)
        return res
          .status(500)
          .json({ title: 'homes.nameUndefined', msg: 'homes.nameUndefined' });

      home.name = nickname;
      home.save({ fields: ['name'] });
    } else {
      home.UserHome.nickname =
        nickname && nickname.length > 0 ? nickname : null;
      home.UserHome.save({ fields: ['nickname'] });
    }

    await home.save();
    res.json({
      title: 'homes.homeRenamed',
      msg: 'homes.homeRenamed',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ######################## Members ########################

Homes.post(
  '/:refnumber/members/invite',
  validateHome,
  async (req: any, res: any) => {
    try {
      if (await denyIfNotOwner(req, res)) return;

      // if home.members contains email -> error, already in home
      // TODO: notifications
      // add invitation db
      // send email

      res.json({ title: 'homes.invitationSent', msg: 'homes.invitationSent' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
  }
);

// ######################## Requests ########################

Homes.delete(
  '/:refnumber/request/cancel',
  validateHome,
  async (req: any, res: any) => {
    try {
      let home = res.locals.home;
      if (home.accepted)
        return res
          .status(501)
          .json({ title: 'homes.couldNotJoin', msg: 'homes.alreadyInHome' });

      home.UserHome.destroy({ force: true });

      res.json({
        title: 'homes.requestCancelled',
        msg: 'homes.requestCancelled',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
  }
);

export default Homes;
