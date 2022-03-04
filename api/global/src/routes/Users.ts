import express from 'express';
import * as Image from '../../../shared/src/routes/Image';
import { notifyMembersExceptOwner } from '../../../shared/src/routes/Homes';

const Users = express.Router();

const db = require('../../../shared/db/models');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: __dirname + '/./../../../shared/.env' });

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

const sendProfilePicture = async (
  req: any,
  res: any,
  asFile: boolean
): Promise<void> => {
  try {
    if (!req?.user?.ImageId)
      return res.status(404).json({
        title: 'picture.notFound',
        msg: 'picture.notFound',
      });

    let img = await db.Image.findOne({ where: { id: req.user.ImageId } });
    if (!img)
      return res.status(404).json({
        title: 'picture.notFound',
        msg: 'picture.notFound',
      });

    if (asFile) return res.sendFile(img.filePath);
    else return res.json({ url: img.url });
  } catch (error) {
    /* istanbul ignore next */
    return res
      .status(500)
      .json({ title: 'request.error', msg: 'request.error' });
  }
};

// ########################################################
// ######################### GET ##########################
// ########################################################

Users.get('/current/picture', async (req: any, res: any) => {
  return await sendProfilePicture(req, res, true);
});

Users.get('/current/picture/url', async (req: any, res: any) => {
  return await sendProfilePicture(req, res, false);
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// Upload a new profile picture.
Users.put('/current/picture', async (req: any, res: any) => {
  try {
    const oldImgId = req.user.ImageId;

    const result = await Image.save(
      req,
      __dirname + '/./../../images/profiles'
    );
    if (!result.success) return res.status(500).json(result);
    await req.user.setImage(result.image);

    if (oldImgId) await Image.remove(oldImgId, true);

    res.json({ title: 'picture.updated', msg: 'user.imageUpdated' });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### POST #########################
// ########################################################

// Register a new user.
Users.post('/register', async (req, res) => {
  try {
    const { email, firstname, lastname, phone } = req.body;
    if (!(email && firstname && lastname && phone && req.body.password))
      return res
        .status(500)
        .json({ title: 'request.missingField', msg: 'request.missingField' });

    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.password, salt);

    const user = await db.User.create({
      email,
      password,
      firstname,
      lastname,
      phone,
    });

    if (user) {
      // TODO: Send verification email

      return res.json({
        title: 'register.success',
        msg: 'register.success',
      });
    }

    /* istanbul ignore next */
    res.status(500).json({
      title: 'request.error',
      msg: 'request.error',
    });
  } catch (e) {
    res.status(500).json({
      title: (e as any).errors?.[0] ? 'register.error' : 'request.error',
      msg: (e as any).errors?.[0]?.message ?? 'request.error',
      input: (e as any).errors?.[0]?.path ?? null,
    });
  }
});

// Users.post('/public/password/reset', async (req, res) => {
//   try {
//     // TODO: Reset password
//   } catch (error) {
//     /* istanbul ignore next */
//     res.status(500).json({ title: 'request.error', msg: 'request.error' });
//   }
// });

// ########################################################
// ######################## DELETE ########################
// ########################################################

// Deletes profile picture.
Users.delete('/current/picture', async (req: any, res: any) => {
  try {
    if (!req.user.ImageId)
      return res
        .status(404)
        .json({ title: 'picture.couldNotDelete', msg: 'user.imageNotFound' });

    const imgId = req.user.ImageId;

    await req.user.setImage(null);

    const result = await Image.remove(imgId, true);
    if (!result.success) return res.status(500).json(result);

    res.json({ title: 'picture.deleted', msg: 'user.imageDeleted' });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// Deletes the logged in user
Users.delete('/delete', async (req: any, res: any) => {
  try {
    await db.sequelize.transaction(async (t: any) => {
      // Delete all owned homes and send notifications
      const homes = await req.user.getOwnedHomes();
      await homes.forEach(async (h: any) => {
        await notifyMembersExceptOwner(h, t);
      });

      let homeIds = homes.map((h: any) => h.id);

      // Delete home invitations
      await db.HomeInvitation.destroy(
        { where: { homeId: homeIds }, force: true },
        { transaction: t }
      );

      // Delete homes
      await db.Home.destroy(
        { where: { id: homeIds }, force: true },
        { transaction: t }
      );

      // Delete user
      await req.user.destroy(
        { force: true },
        { transaction: t, individualHooks: true }
      );

      // Delete user image, if the user has one
      if (req.user.ImageId) {
        const result = await Image.remove(req.user.ImageId, true);
        if (!result.success) return res.status(500).json(result);
      }

      res.json({ title: 'user.deleted', msg: 'user.deleted' });
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Users;
