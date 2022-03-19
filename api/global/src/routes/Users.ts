import express from 'express';
import * as Image from '../../../shared/src/routes/Image';
import * as Global from '../../../shared/src/routes/Global';
import { notifyMembersExceptOwner } from '../../../shared/src/routes/Homes';
import { email, sendEmail } from '../../../shared/src/routes/Email';

const Users = express.Router();

const db = require('../../../shared/db/models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
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

Users.get('/public/password/reset/:token', async (req, res) => {
  try {
    let pwdReset = await db.PasswordReset.findOne({
      where: { token: req.params.token },
    });
    if (!pwdReset)
      return res
        .status(404)
        .json({ title: 'token.notFound', msg: 'token.notFound' });

    let tokenExpiration = new Date(pwdReset.createdAt);
    tokenExpiration.setDate(
      tokenExpiration.getDate() + pwdReset.expirationDays
    );

    if (tokenExpiration < new Date())
      return res
        .status(500)
        .json({ title: 'token.expired', msg: 'token.expiredPwd' });

    res.json({
      title: 'request.success',
      msg: 'request.success',
      token: req.params.token,
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// Verify a user account using token, then respond an html page
Users.get('/public/verify/:token', async (req, res) => {
  try {
    let verifEmail = await db.VerificationEmail.findOne({
      where: { token: req.params.token },
      include: [{ model: db.User, attributes: ['id', 'emailVerifiedAt'] }],
    });

    const html = await Global.readHtml(__dirname + '/_html/responsePage.html');

    // If the token is not associated to a verification email
    if (!verifEmail)
      return Global.respondHtml(
        res,
        Global.format(html, [
          'Verification Token Not Found',
          'No verification email is linked to that URL.',
        ]),
        404
      );

    // If user is already verified
    if (verifEmail.User.emailVerifiedAt !== null)
      return Global.respondHtml(
        res,
        Global.format(html, [
          'Account Already Verified',
          'The account associated to that verification URL is already verified.',
        ]),
        500
      );

    // If token is expired
    var expirationDate = new Date(verifEmail.createdAt);
    expirationDate.setDate(
      expirationDate.getDate() + verifEmail.expirationDays
    );
    if (expirationDate < new Date())
      return Global.respondHtml(
        res,
        Global.format(html, [
          'Verification URL Expired',
          'This verification url is expired. Try logging in again.',
        ]),
        500
      );

    let user = verifEmail.User;
    user.emailVerifiedAt = new Date();
    await user.save();

    await db.VerificationEmail.destroy({
      where: { userId: user.id },
      force: true,
    });

    return Global.respondHtml(
      res,
      Global.format(html, ['Account Verified', 'You can close this page.']),
      200
    );
  } catch (error) {
    try {
      const html = await Global.readHtml(
        __dirname + '/_html/responsePage.html'
      );

      Global.respondHtml(
        res,
        Global.format(html, ['An error occured', 'Please try again.']),
        500
      );
    } catch (error) {
      /* istanbul ignore next */
      res.status(500).json({ title: 'request.error', msg: 'request.error' });
    }
  }
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

// Update user password associated to token
Users.put('/public/password/reset/:token', async (req, res) => {
  try {
    if (req.body.password !== req.body.cpassword)
      return res
        .status(500)
        .json({ title: 'request.error', msg: 'request.error' });

    let pwdReset = await db.PasswordReset.findOne({
      where: { token: req.params.token },
      include: [{ model: db.User, attributes: ['id', 'password'] }],
    });
    if (!pwdReset)
      return res
        .status(404)
        .json({ title: 'token.notFound', msg: 'token.notFound' });

    let tokenExpiration = new Date(pwdReset.createdAt);
    tokenExpiration.setDate(
      tokenExpiration.getDate() + pwdReset.expirationDays
    );

    if (tokenExpiration < new Date())
      return res
        .status(500)
        .json({ title: 'token.expired', msg: 'token.expiredPwd' });

    await db.sequelize.transaction(async (t: any) => {
      let user = pwdReset.User;
      const salt = bcrypt.genSaltSync(10);
      const password = bcrypt.hashSync(req.body.password, salt);
      user.password = password;
      await user.save({ transaction: t });
      await pwdReset.destroy({ force: true }, { transaction: t });
    });

    res.json({ title: 'pwdReset.success', msg: 'pwdReset.success' });
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

// Sends a password reset url to the specified email, if it exists
Users.post('/public/password/reset', async (req, res) => {
  try {
    if (
      !req.body.email ||
      !req.body.email.length ||
      !req.body.email.includes('@')
    )
      return res
        .status(500)
        .json({ title: 'form.email.error', msg: 'form.error.email.valid' });

    let user = await db.User.findOne({ where: { email: req.body.email } });
    if (!user)
      return res
        .status(404)
        .json({ title: 'user.notFound', msg: 'user.notAssociatedToEmail' });

    const token = Global.createToken(4);
    const pwdReset = await db.sequelize.transaction(async (t: any) => {
      await db.PasswordReset.destroy(
        {
          where: { userId: user.id },
          force: true,
        },
        { transaction: t }
      );

      return await db.PasswordReset.create(
        {
          userId: user.id,
          token: token,
        },
        { transaction: t }
      );
    });

    const emailHtml = Global.format(
      await Global.readHtml(__dirname + '/_html/passwordReset.html'),
      [token]
    );

    const mailRes = await sendEmail({
      from: email.sender,
      to: req.body.email,
      subject: `Your Cotulity Password Reset Request`,
      html: emailHtml,
    });

    if (!mailRes.success) {
      await pwdReset.destroy({ force: true });
      return res
        .status(500)
        .json({ title: 'email.didNotSend', msg: 'email.didNotSend' });
    }

    res.json({ title: 'email.sent', msg: 'email.sent' });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

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
