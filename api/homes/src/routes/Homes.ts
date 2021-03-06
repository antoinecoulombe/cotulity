import express from 'express';
import * as Translate from '../../../shared/src/routes/Translate';
import * as Global from '../../../shared/src/routes/Global';
import { validateApp } from '../../../shared/src/routes/Apps';

const Homes = express.Router();
const db = require('../../../shared/db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

/**
 * Verifies that the app is online.
 */
Homes.use(async (req: any, res, next) => {
  if (req.path.startsWith('/public')) return next();

  req.params.appname = 'homes';
  validateApp(req, res, next);
});

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

/**
 * Gets the homes the connected user is part of.
 * @param req The HTTP request.
 * @param res The HTTP response.
 * @param all A boolean indicating whether the method should also retrieve
 * the homes where the connected user is not accepted. By default, this is set to false.
 */
const getHomes = async (req: any, res: any, all: boolean): Promise<void> => {
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
          'HomeUser',
          'nickname',
          'accepted',
        ])
      ),
    });
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
};

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
  try {
    return await db.sequelize.transaction(async (t: any) => {
      const invite = await db.HomeInvitation.findOne({
        where: { token: req.params.token },
        include: db.Home,
      });

      const html = await Global.readHTML(
        __dirname + '/_html/responsePage.html'
      );
      if (!html) throw 'Could not read HTML file.';

      // If invitation is not found
      if (!invite) {
        return Global.sendHTML(
          res,
          Global.format(html, [
            'Invitation not found',
            'No invitation is linked to that token.',
          ]),
          404
        );
      }

      // If invitation has been accepted or denied
      if (invite.accepted !== null) {
        return Global.sendHTML(
          res,
          Global.format(html, [
            `Invitation Already ${invite.accepted ? 'Accepted' : 'Denied'}`,
            `This invitation has already been ${
              invite.accepted ? 'accepted' : 'denied'
            }.`,
          ]),
          500
        );
      }

      // Reject invitation for records
      invite.accepted = false;
      await invite.save();

      // Soft delete invitation
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

      return Global.sendHTML(
        res,
        Global.format(html, [
          'Invitation declined',
          'You can close this page.',
        ]),
        200
      );
    });
  } catch (e) {
    /* istanbul ignore next */
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
        paranoid: false,
      });

      if (!invite) {
        return res.status(404).json({
          title: 'homes.inviteNotFound',
          msg: 'homes.inviteNotFound',
        });
      }

      if (invite.accepted !== null)
        return res.status(500).json({
          title: `homes.already${invite.accepted ? 'Accepted' : 'Denied'}`,
          msg: `homes.already${invite.accepted ? 'Accepted' : 'Denied'}`,
        });

      const userInHome = await db.HomeUser.findOne({
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

      const homeUser = await db.HomeUser.findOne({
        where: { homeId: invite.Home.id, userId: req.user.id },
        paranoid: false,
      });

      // If user is in home
      if (homeUser) {
        // If he is not accepted
        if (!homeUser.accepted) {
          homeUser.accepted = true;
          await homeUser.save({ transaction: t });
        }
        // If he is deleted
        if (homeUser.deletedAt != null)
          await homeUser.restore({ transaction: t });
      } else {
        // If he is not in home
        await db.HomeUser.create(
          {
            homeId: invite.Home.id,
            userId: req.user.id,
            accepted: true,
          },
          { transaction: t }
        );
      }

      invite.accepted = true;
      await invite.save({ transaction: t });
      await invite.destroy({ transaction: t });

      return res.json({
        title: Translate.getJSON('homes.homeJoined', [invite.Home.name]),
        msg: 'newHome.created',
      });
    });
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// [ANY] Create a request to join the specified home.
Homes.put('/:refnumber/join', async (req: any, res) => {
  try {
    const homeDb = await req.user.getHomes({
      where: { refNumber: req.params.refnumber },
      through: { paranoid: false },
    });

    if (homeDb.length !== 0) {
      if (homeDb[0].HomeUser.deletedAt != null) {
        if (
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) <
          homeDb[0].HomeUser.deletedAt
        )
          return res.status(500).json({
            title: 'homes.requestAlreadyDenied',
            msg: 'homes.waitWeek',
          });
      } else {
        if (homeDb[0].HomeUser.accepted)
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
      where: { refNumber: req.params.refnumber },
    });

    if (!home)
      return res
        .status(404)
        .json({ title: 'homes.notFound', msg: 'homes.notFound' });

    await db.sequelize.transaction(async (t: any) => {
      await db.Notification.create(
        {
          typeId: 2,
          toId: home.ownerId,
          title: Translate.getJSON('homes.newRequest', [home.name]),
          description: Translate.getJSON('homes.newRequest', [
            req.user.firstname,
            home.name,
          ]),
        },
        { transaction: t }
      );

      if (homeDb[0]?.HomeUser?.deletedAt != null)
        return homeDb[0].HomeUser.restore({}, { transaction: t });
      else return req.user.addHomes(home.id, { transaction: t });
    });

    res.json({
      title: 'homes.requestSent',
      msg: 'homes.requestSent',
    });
  } catch (e) {
    /* istanbul ignore next */
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

      await db.HomeUser.create(
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
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

export default Homes;
