import express from 'express';
import * as Image from './_utils/Image';
import { deleteHome, notifyMembersExceptOwner } from './apps/Homes';
import { deleteNotificationsToUser } from './Notifications';

const Users = express.Router();

const db = require('../db/models');
const bcrypt = require('bcryptjs');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

export async function deleteUsersFromHome(
  home: any,
  transaction: any
): Promise<{ success: boolean; title: string; msg: string }> {
  try {
    await db.UserHome.destroy(
      { where: { homeId: home.id }, force: true },
      { transaction: transaction }
    );

    return { success: true, title: 'request.success', msg: 'request.success' };
  } catch (error) {
    console.log(error);
    return { success: false, title: 'request.error', msg: 'request.error' };
  }
}

// ########################################################
// ######################### GET ##########################
// ########################################################

Users.get('/image', async (req: any, res: any) => {
  try {
    if (!req.user.imageId)
      return res
        .status(404)
        .json({ title: 'picture.notFound', msg: 'picture.notFound' });

    const img = await db.Image.findOne({ where: { id: req.user.imageId } });
    res.sendFile(img.filePath);
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// Upload a new profile picture.
Users.put('/image', async (req: any, res: any) => {
  try {
    if (req.user.ImageId) await Image.remove(req.user.ImageId);

    const result = await Image.save(req, 'profiles');
    if (!result.success) return res.status(500).json(result);

    await req.user.setImage(result.image);

    res.json({ title: 'picture.updated', msg: 'user.imageUpdated' });
  } catch (error) {
    console.log(error);
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
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.password, salt);

    const user = await db.User.create({
      email,
      password,
      firstname,
      lastname,
      phone,
    });

    res.json({
      title: 'register.success',
      msg: 'register.success',
    });
  } catch (e) {
    res.status(500).json({
      title: e.errors[0] ? 'register.error' : 'request.error',
      msg: e.errors[0]?.message ?? 'request.error',
      input: e.errors[0]?.path ?? null,
    });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

// Deletes profile picture.
Users.delete('/image/delete', async (req: any, res: any) => {
  try {
    if (!req.user.ImageId)
      return res
        .status(404)
        .json({ title: 'picture.couldNotDelete', msg: 'user.imageNotFound' });

    const result = await Image.remove(req.user.ImageId);
    if (!result.success) return res.status(500).json(result);

    await req.user.setImage(null);

    res.json({ title: 'picture.deleted', msg: 'user.imageDeleted' });
  } catch (error) {
    console.log(error);
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

      // Delete user
      await req.user.destroy(
        { force: true },
        { transaction: t, individualHooks: true }
      );

      // Delete user image
      Image.remove(req.user.ImageId);

      res.json({ title: 'user.deleted', msg: 'user.deleted' });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Users;
