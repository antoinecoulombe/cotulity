import express from 'express';
import * as Image from './_utils/Image';
import { deleteHome } from './apps/Home';

const Users = express.Router();

const db = require('../../db/models');
const bcrypt = require('bcryptjs');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

async function sendProfilePicture(req: any, res: any, asFile: boolean) {
  let img = await db.Image.findOne({ where: { id: req.user.ImageId } });
  if (!img)
    return res.status(404).json({
      title: 'picture.notFound',
      msg: 'picture.notFound',
    });

  if (asFile) res.sendFile(img.filePath);
  else res.json({ url: img.url });
}

// ########################################################
// ######################### GET ##########################
// ########################################################

Users.get('/current/picture', async (req: any, res: any) => {
  try {
    return await sendProfilePicture(req, res, true);
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

Users.get('/current/picture/url', async (req: any, res: any) => {
  try {
    return await sendProfilePicture(req, res, false);
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// Upload a new profile picture.
Users.put('/current/picture', async (req: any, res: any) => {
  try {
    const oldImgId = req.user.ImageId;

    const result = await Image.save(req, 'profiles');
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
        await deleteHome(h, t);
      });

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
