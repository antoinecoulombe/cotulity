import express from 'express';
import * as Translate from '../../../shared/src/routes/Translate';
import * as Global from '../../../shared/src/routes/Global';
import { email, sendEmail } from '../../../shared/src/routes/Email';
import { validateApp } from '../../../shared/src/routes/Apps';
import {
  notifyMembersExceptOwner,
  denyIfNotOwner,
  getMembersExceptOwner,
  getMembersExceptRequester,
  getHomeUsers,
} from '../../../shared/src/routes/Homes';

const Home = express.Router();
const db = require('../../../shared/db/models');
const { Op } = require('sequelize');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

/**
 * Verifies that the app is online.
 */
Home.use(async (req: any, res, next) => {
  req.params.appname = 'homes';
  validateApp(req, res, next);
});

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

/**
 * Deletes a home and notifies the members.
 * @param home A sequelize home object.
 * @param transaction A sequelize transaction object.
 * @returns A promise to return an object containing the result of the home deletion.
 */
export const deleteHome = async (
  home: any,
  transaction: any
): Promise<{ title: string; msg: string }> => {
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
};

// ########################################################
// ######################### GET ##########################
// ########################################################

/**
 * [OWNER] Gets home associated to specified reference number.
 */
Home.get('/', async (req: any, res: any) => {
  try {
    if (await denyIfNotOwner(req, res)) return;

    const homes = await req.user.getHomes({
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

    // Check if home exists
    if (!homes || !homes.length)
      return res
        .status(404)
        .json({ title: 'homes.notFound', msg: 'homes.notFound' });

    res.json(homes[0]);
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

/**
 * Gets accepted home users.
 */
Home.get('/users', async (req: any, res: any) => {
  try {
    let users = await getHomeUsers(db, res);

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

/**
 * [OWNER/MEMBER] Renames the specified home.
 */
Home.put('/rename', async (req: any, res: any) => {
  try {
    const nickname = req.body.nickname;
    let home = res.locals.home;
    let originalName = home.name;

    // If the connected user is the owner, rename the home directly
    if (home.ownerId === req.user.id) {
      await db.sequelize.transaction(async (t: any) => {
        // Check if the nickname is valid
        if (!nickname || !nickname.length)
          return res.status(500).json({
            title: 'homes.couldNotRename',
            msg: 'homes.nameUndefined',
          });

        // Notify other members of change
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

        // Update home
        home.name = nickname;
        await home.save({ transaction: t });
      });

      if (res.headersSent) return;
    } else {
      // Otherwise, update the home nickname in join table (HomeUser)
      home.HomeUser.nickname = nickname && nickname.length ? nickname : null;
      home.HomeUser.save({ fields: ['nickname'] });
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

/**
 * [OWNER] Accepts or declines a request to join the specified home.
 */
Home.put('/requests/:id/:action', async (req: any, res: any) => {
  try {
    const actions = ['accept', 'reject'];
    const action = req.params.action;

    // Check if action is valid
    if (!action || !actions.includes(action))
      return res
        .status(404)
        .json({ title: 'request.notFound', msg: 'request.notFound' });

    if (await denyIfNotOwner(req, res)) return;

    return await db.sequelize.transaction(async (t: any) => {
      // Get join table row (home user)
      let homeUser = await db.HomeUser.findOne({
        where: { userId: req.params.id, homeId: res.locals.home.id },
        include: [db.Home, db.User],
      });

      // Check if user exists in home
      if (!homeUser)
        return res
          .status(404)
          .json({ title: 'request.notFound', msg: 'request.notFound' });

      // Accept the user
      if (action == 'accept') {
        homeUser.accepted = true;
        await homeUser.save({ transaction: t });

        // Notify other members
        await Global.sendNotifications(
          (
            await getMembersExceptOwner(res.locals.home)
          ).filter((id: number) => id != req.params.id),
          {
            typeId: 2,
            title: Translate.getJSON('homes.memberAdded', [homeUser.Home.name]),
            description: Translate.getJSON('memberRequestApproved', [
              homeUser.User.firstname,
            ]),
          },
          t
        );
      } else if (action == 'reject') {
        // Deny the user, and soft delete it
        await homeUser.destroy({ transaction: t });
      }

      // Notify the concerned user (home join requester)
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

/**
 * [OWNER] Invites a new member into the specified home.
 */
Home.post('/invitations', async (req: any, res: any) => {
  try {
    if (await denyIfNotOwner(req, res)) return;

    // Check if email is valid
    if (
      !req.body.email ||
      !req.body.email.length ||
      !req.body.email.includes('@')
    )
      return res
        .status(500)
        .json({ title: 'homes.couldNotSendInvite', msg: 'form.email.error' });

    // Get home member with email
    const member = await res.locals.home.getMembers({
      where: { email: req.body.email },
    });

    // Check if the user with email is already part of the home
    if (member.length)
      return res.status(500).json({
        title: 'homes.couldNotSendInvite',
        msg: 'homes.emailAlreadyInHome',
      });

    const token = Global.createToken();

    // Create home invitation
    const invite = await db.HomeInvitation.create({
      homeId: res.locals.home.id,
      email: req.body.email,
      token: token,
    });

    // Read and format the HTML to be sent via email
    const emailHTML = await Global.readHTML(
      __dirname + '/_html/emailInvite.html'
    );
    if (!emailHTML) throw 'Could not read HTML.';

    const formattedEmailHTML = Global.format(emailHTML, [
      res.locals.home.name,
      token,
    ]);

    // Send the email
    const mailRes = await sendEmail({
      from: email.sender,
      to: req.body.email,
      subject: `You have been invited to join '${res.locals.home.name}' on Cotulity!`,
      html: formattedEmailHTML,
    });

    // Check if the email was sent
    if (!mailRes.success) {
      await invite.destroy({ force: true });
      return res.status(500).json({ ...mailRes, token: null });
    }

    res.json({ ...mailRes, token: token });
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

/**
 * [OWNER] Removes a member from the specified home.
 */
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
      let homeUser = await db.HomeUser.findOne({
        where: { userId: req.params.id, homeId: res.locals.home.id },
        include: [db.Home, db.User],
      });

      // Check if the user exists in home
      if (!homeUser)
        return res
          .status(404)
          .json({ title: 'request.notFound', msg: 'request.notFound' });

      // Notify the other members
      await Global.sendNotifications(
        (
          await getMembersExceptOwner(res.locals.home)
        ).filter((id: number) => id != req.params.id),
        {
          typeId: 2,
          title: Translate.getJSON('homes.memberLost', [homeUser.Home.name]),
          description: Translate.getJSON('homes.memberExcluded', [
            homeUser.User.firstname,
            homeUser.Home.name,
          ]),
        },
        t
      );

      // Notify the excluded user
      await db.Notification.create(
        {
          typeId: 3,
          toId: req.params.id,
          title: Translate.getJSON('homes.excludedByOwner', [
            homeUser.Home.name,
          ]),
          description: 'homes.excludedByOwner',
        },
        { transaction: t }
      );

      // Delete the user from home
      await homeUser.destroy({ force: true }, { transaction: t });

      return res.json({ title: 'request.success', msg: 'request.success' });
    });
  } catch (e) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

/**
 * [OWNER] Deletes the specified home.
 */
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

/**
 * [MEMBER] Quits the specified home.
 */
Home.delete('/quit', async (req: any, res: any) => {
  try {
    // Refuse quit because owner can't quit
    if (req.user.id === res.locals.home.ownerId)
      return res
        .status(403)
        .json({ title: 'request.denied', msg: 'request.unauthorized' });

    return await db.sequelize.transaction(async (t: any) => {
      // Notify the other members
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

      // Delete user from home
      await res.locals.home.HomeUser.destroy(
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

/**
 * [REQUEST] Cancels the request to the specified home.
 */
Home.delete('/requests/cancel', async (req: any, res: any) => {
  try {
    let home = res.locals.home;

    // Check if the connected user is already accepted
    if (home.HomeUser.accepted)
      return res.status(501).json({
        title: 'homes.couldNotCancelRequest',
        msg: 'homes.alreadyInHome',
      });

    await home.HomeUser.destroy({ force: true });

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
