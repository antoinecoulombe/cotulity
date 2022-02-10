import express from 'express';
import * as Translate from '../_utils/Translate';
import * as Global from '../_utils/Global';
import * as Email from '../_utils/Email';
import { validateHome, validateApp } from '../Apps';

const Homes = express.Router();
const db = require('../../../db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// Validates application and paths.
Homes.use(async (req: any, res, next) => {
  if (req.path.startsWith('/public')) {
    return next();
  }

  req.params.appname = 'homes';
  validateApp(req, res, next);
});

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

// Get home list.
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
  } catch (e) {
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
}

// ########################################################
// ######################### GET ##########################
// ########################################################

// [ANY] Get all homes.
Homes.get('/', async (req: any, res) => {
  getHomes(req, res, true);
});

// [ANY] Get all accepted homes.
Homes.get('/accepted', async (req: any, res) => {
  getHomes(req, res, false);
});

// [PUBLIC] Decline the invitation linked to the specified token.
Homes.get('/public/invitations/:token/decline', async (req: any, res: any) => {
  console.log('Decline');
  try {
    return await db.sequelize.transaction(async (t: any) => {
      const invite = await db.HomeInvitation.findOne({
        where: { token: req.params.token },
        include: db.Home,
      });

      const html = await Global.readHtml('../_html/responsePage.html');

      if (!invite) {
        return Global.respondHtml(
          res,
          Global.format(html, [
            'Invitation not found',
            'No invitation is linked to that token.',
          ]),
          404
        );
      }

      await invite.destroy({ transaction: t });

      await db.Notification.create(
        {
          typeId: 2,
          toId: invite.Home.ownerId,
          title: Translate.getJSON('homes.inviteDeclined', [invite.Home.name]),
          description: Translate.getJSON('homes.inviteDeclined', [
            invite.email,
            invite.Home.name,
          ]),
        },
        { transaction: t }
      );

      return Global.respondHtml(
        res,
        Global.format(html, [
          'Invitation declined',
          'You can close this page.',
        ]),
        200
      );
    });
  } catch (e) {
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// [ANY] Accept the invitation linked to the specified token.
Homes.put('/invitations/:token/accept', async (req: any, res: any) => {
  try {
    return await db.sequelize.transaction(async (t: any) => {
      const invite = await db.HomeInvitation.findOne({
        where: { token: req.params.token },
        include: db.Home,
      });

      if (!invite) {
        return res.status(404).json({
          title: 'homes.inviteNotFound',
          msg: 'homes.inviteNotFound',
        });
      }

      const userInHome = await db.UserHome.findOne({
        where: { homeId: invite.Home.id, userId: req.user.id, accepted: true },
      });
      if (userInHome) {
        await invite.destroy();
        return res.status(500).json({
          title: 'homes.couldNotJoin',
          msg: 'homes.alreadyInHome',
        });
      }

      const expiration = new Date(
        Date.parse(invite.createdAt) +
          invite.expirationDays * 24 * 60 * 60 * 1000
      );
      if (new Date(Date.now()) > expiration)
        return res.status(500).json({
          title: 'homes.inviteExpired',
          msg: 'homes.inviteExpired',
        });

      await Global.sendNotifications(
        (await invite.Home.getMembers())
          .filter((m: any) => m.id !== req.user.id)
          .map((m: any) => m.id),
        {
          typeId: 2,
          title: Translate.getJSON('homes.memberAdded', [invite.Home.name]),
          description: Translate.getJSON('homes.memberAcceptedInvite', [
            req.user.firstname,
            invite.Home.name,
          ]),
        },
        t
      );

      const userHome = await db.UserHome.findOne({
        where: { homeId: invite.Home.id, userId: req.user.id },
        paranoid: false,
      });
      if (userHome) {
        if (!userHome.accepted) {
          userHome.accepted = true;
          await userHome.save({ transaction: t });
        }
        if (userHome.deletedAt != null)
          await userHome.restore({ transaction: t });
      } else {
        await db.UserHome.create(
          {
            homeId: invite.Home.id,
            userId: req.user.id,
            accepted: true,
          },
          { transaction: t }
        );
      }

      await invite.destroy({ transaction: t });

      return res.json({
        title: Translate.getJSON('homes.homeJoined', [invite.Home.name]),
        msg: 'newHome.created',
      });
    });
  } catch (e) {
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### POST #########################
// ########################################################

// [ANY] Create a new home.
Homes.post('/:homename', async (req: any, res) => {
  try {
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
          name: req.params.homename,
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
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

export default Homes;
