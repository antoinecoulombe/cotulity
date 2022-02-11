import express from 'express';
import * as Translate from '../_utils/Translate';
import * as Global from '../_utils/Global';
import * as Email from '../_utils/Email';
import { validateHome, validateApp } from '../Apps';

const Home = express.Router();
const db = require('../../../db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// Validates application and paths.
Home.use(async (req: any, res, next) => {
  req.params.appname = 'homes';
  validateApp(req, res, next);
});

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

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

// Retrieves the members from the current home, excluding the connected user.
async function getMembersExceptRequester(
  req: any,
  res: any
): Promise<number[]> {
  return (await res.locals.home.getMembers())
    .filter((m: any) => m.id !== req.user.id)
    .map((m: any) => m.id);
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
  // Send notifications to deleted users
  await notifyMembersExceptOwner(home, transaction);

  await db.HomeInvitation.destroy(
    { where: { homeId: home.id }, force: true },
    { transaction: transaction }
  );

  // Delete home
  await home.destroy({ force: true }, { transaction: transaction });
  return {
    title: Translate.getJSON('homes.homeDeleted', [home.name]),
    msg: 'homes.homeDeleted',
  };
}

// ########################################################
// ######################### GET ##########################
// ########################################################

// [ANY] Get home associated to specified reference number.
Home.get('/', async (req: any, res: any) => {
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
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

Home.get('/users', async (req: any, res: any) => {
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
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// [OWNER/MEMBER] Rename specified home.
Home.put('/rename', async (req: any, res: any) => {
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

      if (res.headersSent) return;
    } else {
      home.UserHome.nickname = nickname && nickname.length ? nickname : null;
      home.UserHome.save({ fields: ['nickname'] });
    }

    return res.json({
      title: Translate.getJSON('homes.homeRenamed', [originalName]),
      msg: Translate.getJSON('homes.homeRenamed', [nickname]),
    });
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({
      title: (e as any).errors?.[0] ? 'homes.renameError' : 'request.error',
      msg: (e as any).errors?.[0]?.message ?? 'request.error',
    });
  }
});

// [OWNER] Accept or decline a request to join the specified home.
Home.put('/requests/:id/:action', async (req: any, res: any) => {
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
            title: Translate.getJSON('homes.memberAdded', [userHome.Home.name]),
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
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### POST #########################
// ########################################################

// [OWNER] Invite a new member into the specified home.
Home.post('/invitations', async (req: any, res: any) => {
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

    if (req.body.fake && req.body.fake === true)
      return res.json({
        title: 'homes.invitationSent',
        msg: 'homes.invitationSent',
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
            console.log(error);
            invite.destroy({ force: true });
            return res.status(500).json({
              title: 'homes.emailDidNotSend',
              msg: 'request.error',
            });
          }

          return res.json({
            title: 'homes.invitationSent',
            msg: 'homes.invitationSent',
            token: token,
          });
        }
      );
    } catch (e) {
      invite.destroy({ force: true });
      throw e;
    }
  } catch (e) {
    res.status(500).json({
      title: (e as any).errors?.[0] ? 'homes.inviteError' : 'request.error',
      msg: (e as any).errors?.[0]?.message ?? 'request.error',
    });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

// [OWNER] Remove a member from the specified home.
Home.delete('/members/:id/remove', async (req: any, res: any) => {
  try {
    // Refuse removal if requester is not the owner
    if (await denyIfNotOwner(req, res)) return;

    // Refuse removal because owner can't delete himself
    if (req.params.id == res.locals.home.ownerId)
      return res
        .status(403)
        .json({ title: 'request.denied', msg: 'request.unauthorized' });

    return await db.sequelize.transaction(async (t: any) => {
      let userHome = await db.UserHome.findOne({
        where: { userId: req.params.id, homeId: res.locals.home.id },
        include: [db.Home, db.User],
      });

      // If no user is found in home
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
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// [OWNER] Delete the specified home.
Home.delete('/delete', async (req: any, res: any) => {
  try {
    // Refuse access if requester is not the owner
    if (await denyIfNotOwner(req, res)) return;

    return await db.sequelize.transaction(async (t: any) => {
      return res.json(await deleteHome(res.locals.home, t));
    });
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// [MEMBER] Quit the specified home.
Home.delete('/quit', async (req: any, res: any) => {
  try {
    // Refuse quit because owner can't quit
    if (req.user.id === res.locals.home.ownerId)
      return res
        .status(403)
        .json({ title: 'request.denied', msg: 'request.unauthorized' });

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
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// [REQUEST] Cancel the request to the specified home.
Home.delete('/requests/cancel', async (req: any, res: any) => {
  try {
    let home = res.locals.home;
    if (home.UserHome.accepted)
      return res.status(501).json({
        title: 'homes.couldNotCancelRequest',
        msg: 'homes.alreadyInHome',
      });

    await home.UserHome.destroy({ force: true });

    res.json({
      title: 'homes.requestCancelled',
      msg: Translate.getJSON('homes.requestCancelled', [home.name]),
    });
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Home;
