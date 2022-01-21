import express from 'express';
import * as Translate from '../_utils/Translate';
import * as Global from '../_utils/Global';
import * as Email from '../_utils/Email';
import { validateHome, validateApp } from '../Apps';

const Homes = express.Router();
const db = require('../../db/models');

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
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
}

// Returns false if the connected user is not the home owner.
async function denyIfNotOwner(req: any, res: any) {
  if (res.locals.home.ownerId !== req.user.id) {
    res
      .status(403)
      .json({ title: 'request.denied', msg: 'request.unauthorized' });
    return true;
  }
  return false;
}

// Retrieves the members from the current home, excluding the owner.
export async function getMembersExceptOwner(home: any): Promise<number[]> {
  return (await home.getMembers())
    .filter((m: any) => m.id !== home.ownerId)
    .map((m: any) => m.id);
}

export async function notifyMembersExceptOwner(home: any, transaction: any) {
  // Send notifications to deleted users
  await Global.sendNotifications(
    await getMembersExceptOwner(home),
    {
      typeId: 3,
      title: Translate.getJSON('homes.excludedByOwner', [home.name]),
      description: Translate.getJSON('homes.homeDeletedByOwner', [home.name]),
    },
    transaction
  );
}

// deletes a home
export async function deleteHome(home: any, transaction: any) {
  try {
    // Send notifications to deleted users
    await notifyMembersExceptOwner(home, transaction);

    // Delete home
    // await home.destroy({ force: true }, { transaction: transaction });
    return {
      title: Translate.getJSON('homes.homeDeleted', [home.name]),
      msg: 'homes.homeDeleted',
    };
  } catch (error) {
    console.log(error);
    return { title: 'request.error', msg: 'request.error' };
  }
}

// Retrieves the members from the current home, excluding the connected user.
async function getMembersExceptRequester(
  req: any,
  res: any
): Promise<number[]> {
  return (await res.locals.home.getMembers())
    .filter((m: any) => m.id !== req.user.id)
    .map((m: any) => m.id);
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

// [ANY] Get home associated to specified reference number.
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
          attributes: ['id', 'firstname', 'lastname'],
          include: { model: db.Image, attributes: ['url'] },
          through: { attributes: ['nickname', 'accepted', 'deletedAt'] },
        },
      ],
    });

    res.json(home[0]);
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

Homes.get('/:refnumber/users', validateHome, async (req: any, res: any) => {
  try {
    const users = await res.locals.home.getMembers({
      attributes: ['id', 'firstname', 'lastname'],
      include: [
        { model: db.Image, attributes: ['url'] },
        {
          model: db.Task,
          as: 'Tasks',
          attributes: ['id'],
        },
      ],
      through: {
        where: { accepted: true },
      },
    });

    res.json({
      title: 'request.success',
      msg: 'request.success',
      users: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// [ANY] Create a request to join the specified home.
Homes.put('/:refnumber/join', async (req: any, res) => {
  try {
    const userHome = await req.user.getHomes({
      where: { refNumber: req.params.refnumber },
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
      where: { refNumber: req.params.refnumber },
    });

    if (!home)
      return res
        .status(500)
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

// [OWNER] Accept or decline a request to join the specified home.
Homes.put(
  '/:refnumber/requests/:id/:action',
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
          include: [db.Home, db.User],
        });

        if (!userHome)
          return res
            .status(404)
            .json({ title: 'request.notFound', msg: 'request.notFound' });

        if (action == 'accept') {
          userHome.accepted = true;
          await userHome.save({ transaction: t });

          await Global.sendNotifications(
            (
              await getMembersExceptOwner(res.locals.home)
            ).filter((id) => id != req.params.id),
            {
              typeId: 2,
              title: Translate.getJSON('homes.memberAdded', [
                userHome.Home.name,
              ]),
              description: Translate.getJSON('memberRequestApproved', [
                userHome.User.firstname,
              ]),
            },
            t
          );
        } else if (action == 'reject') {
          await userHome.destroy({ transaction: t });
        }

        await db.Notification.create(
          {
            typeId: action == 'accept' ? 2 : 3,
            toId: req.params.id,
            title: Translate.getJSON(
              `homes.request${action == 'accept' ? 'Accepted' : 'Denied'}`,
              [res.locals.home.name]
            ),
            description:
              action == 'accept' ? 'newHome.created' : 'homes.requestDenied',
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

// [OWNER/MEMBER] Rename specified home.
Homes.put('/:refnumber/rename', validateHome, async (req: any, res: any) => {
  try {
    const nickname = req.body.nickname;
    let home = res.locals.home;
    let originalName = home.name;

    if (home.ownerId === req.user.id) {
      await db.sequelize.transaction(async (t: any) => {
        if (!nickname || !nickname.length)
          return res.status(500).json({
            title: 'homes.couldNotRename',
            msg: 'homes.nameUndefined',
          });

        await Global.sendNotifications(
          await getMembersExceptOwner(res.locals.home),
          {
            typeId: 2,
            title: Translate.getJSON('homes.homeRenamedByOwner', [home.name]),
            description: Translate.getJSON('homes.homeRenamedByOwner', [
              home.name,
              nickname,
            ]),
          },
          t
        );

        home.name = nickname;
        await home.save({ transaction: t });
      });
    } else {
      home.UserHome.nickname =
        nickname && nickname.length ? nickname : null;
      home.UserHome.save({ fields: ['nickname'] });
    }

    return res.json({
      title: Translate.getJSON('homes.homeRenamed', [originalName]),
      msg: Translate.getJSON('homes.homeRenamed', [nickname]),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      title: (e as any).errors?.[0] ? 'homes.renameError' : 'request.error',
      msg: (e as any).errors?.[0]?.message ?? 'request.error',
    });
  }
});

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
  } catch (error) {
    console.log(error);
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
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// [OWNER] Invite a new member into the specified home.
Homes.post(
  '/:refnumber/invitations',
  validateHome,
  async (req: any, res: any) => {
    try {
      if (await denyIfNotOwner(req, res)) return;

      const member = await res.locals.home.getMembers({
        where: { email: req.body.email },
      });

      if (member.length)
        return res.status(500).json({
          title: 'homes.couldNotSendInvite',
          msg: 'homes.emailAlreadyInHome',
        });

      const token = Global.createToken(4);

      const invite = await db.HomeInvitation.create({
        homeId: res.locals.home.id,
        email: req.body.email,
        token: token,
      });

      try {
        const emailHtml = Global.format(
          await Global.readHtml('../_html/emailInvite.html'),
          [res.locals.home.name, token]
        );

        return await Email.transporter.sendMail(
          {
            from: Email.FROM,
            to: req.body.email,
            subject: `You have been invited to join '${res.locals.home.name}' on Cotulity!`,
            html: emailHtml,
          },
          (error: any, info: any) => {
            if (error != null) {
              invite.destroy({ force: true });
              return res.status(500).json({
                title: 'homes.emailDidNotSend',
                msg: 'request.error',
              });
            }

            res.json({
              title: 'homes.invitationSent',
              msg: 'homes.invitationSent',
            });
          }
        );
      } catch (e) {
        invite.destroy({ force: true });
        throw e;
      }
    } catch (e) {
      console.log(e);
      res.status(500).json({
        title: (e as any).errors?.[0] ? 'homes.inviteError' : 'request.error',
        msg: (e as any).errors?.[0]?.message ?? 'request.error',
      });
    }
  }
);

// ########################################################
// ######################## DELETE ########################
// ########################################################

// [OWNER] Remove a member from the specified home.
Homes.delete(
  '/:refnumber/members/:id/remove',
  validateHome,
  async (req: any, res: any) => {
    try {
      if (await denyIfNotOwner(req, res)) return;
      if (req.params.id == res.locals.home.ownerId)
        return res
          .status(403)
          .json({ title: 'request.denied', msg: 'request.unauthorized' });

      return await db.sequelize.transaction(async (t: any) => {
        let userHome = await db.UserHome.findOne({
          where: { userId: req.params.id, homeId: res.locals.home.id },
          include: [db.Home, db.User],
        });

        if (!userHome)
          return res
            .status(404)
            .json({ title: 'request.notFound', msg: 'request.notFound' });

        await Global.sendNotifications(
          (
            await getMembersExceptOwner(res.locals.home)
          ).filter((id) => id != req.params.id),
          {
            typeId: 2,
            title: Translate.getJSON('homes.memberLost', [userHome.Home.name]),
            description: Translate.getJSON('homes.memberExcluded', [
              userHome.User.firstname,
              userHome.Home.name,
            ]),
          },
          t
        );

        await db.Notification.create(
          {
            typeId: 3,
            toId: req.params.id,
            title: Translate.getJSON('homes.excludedByOwner', [
              userHome.Home.name,
            ]),
            description: 'homes.excludedByOwner',
          },
          { transaction: t }
        );

        await userHome.destroy({ force: true }, { transaction: t });

        return res.json({ title: 'request.success', msg: 'request.success' });
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
  }
);

// [OWNER] Delete the specified home.
Homes.delete('/:refnumber/delete', validateHome, async (req: any, res: any) => {
  try {
    if (await denyIfNotOwner(req, res)) return;
    return await db.sequelize.transaction(async (t: any) => {
      return res.json(await deleteHome(res.locals.home, t));
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// [MEMBER] Quit the specified home.
Homes.delete('/:refnumber/quit', validateHome, async (req: any, res: any) => {
  try {
    return await db.sequelize.transaction(async (t: any) => {
      await Global.sendNotifications(
        await getMembersExceptRequester(req, res),
        {
          typeId: 2,
          title: Translate.getJSON('homes.memberLost', [res.locals.home.name]),
          description: Translate.getJSON('homes.memberQuit', [
            req.user.firstname,
            res.locals.home.name,
          ]),
        },
        t
      );
      await res.locals.home.UserHome.destroy(
        { force: true },
        { transaction: t }
      );

      return res.json({
        title: Translate.getJSON('homes.homeLeft', [res.locals.home.name]),
        msg: 'homes.homeLeft',
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// [REQUEST] Cancel the request to the specified home.
Homes.delete(
  '/:refnumber/requests/cancel',
  validateHome,
  async (req: any, res: any) => {
    try {
      let home = res.locals.home;
      if (home.UserHome.accepted)
        return res.status(501).json({
          title: 'homes.couldNotCancelRequest',
          msg: 'homes.alreadyInHome',
        });

      home.UserHome.destroy({ force: true });

      res.json({
        title: 'homes.requestCancelled',
        msg: Translate.getJSON('homes.requestCancelled', [home.name]),
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
  }
);

export default Homes;
