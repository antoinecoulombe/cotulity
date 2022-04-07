import express from 'express';
import * as Image from '../../../shared/src/routes/Image';
import * as Global from '../../../shared/src/routes/Global';
import { notifyMembersExceptOwner } from '../../../shared/src/routes/Homes';
import { email, sendEmail } from '../../../shared/src/routes/Email';
import { userInfo } from 'os';

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

/**
 * Sends the profile picture of the connected user, as a file or an URL.
 * @param req The HTTP request.
 * @param res The HTTP responses.
 * @param asFile A boolean indicating whether the image should be sent
 * directly in the response or just its URL contained in a JSON object.
 */
const sendProfilePicture = async (
  req: any,
  res: any,
  asFile: boolean
): Promise<void> => {
  try {
    // Check if the user has a profile picture
    if (!req?.user?.ImageId)
      return res.status(404).json({
        title: 'picture.notFound',
        msg: 'picture.notFound',
      });

    // Get the image
    let img = await db.Image.findOne({ where: { id: req.user.ImageId } });
    if (!img)
      return res.status(404).json({
        title: 'picture.notFound',
        msg: 'picture.notFound',
      });

    // Send as a file
    if (asFile) return res.sendFile(img.filePath);
    else return res.json({ url: img.url }); // or as an URL
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

/**
 * Gets the profile picture of the connected user, as a file.
 */
Users.get('/current/picture', async (req: any, res: any) => {
  return await sendProfilePicture(req, res, true);
});

/**
 * Gets the profile picture of the connected  user, as an URL.
 */
Users.get('/current/picture/url', async (req: any, res: any) => {
  return await sendProfilePicture(req, res, false);
});

/**
 * Checks whether a password reset token exists and is valid.
 */
Users.get('/public/password/reset/:token', async (req, res) => {
  try {
    // Get password reset with specified token
    let pwdReset = await db.PasswordReset.findOne({
      where: { token: req.params.token },
    });

    // Check if password exists
    if (!pwdReset)
      return res
        .status(404)
        .json({ title: 'token.notFound', msg: 'token.notFound' });

    // Create Date object at expiration date
    let tokenExpiration = new Date(pwdReset.createdAt);
    tokenExpiration.setDate(
      tokenExpiration.getDate() + pwdReset.expirationDays
    );

    // Check if token is expired
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

// ########################################################
// ######################### PUT ##########################
// ########################################################

/**
 * Uploads a new profile picture for the connected user.
 */
Users.put('/current/picture', async (req: any, res: any) => {
  try {
    // Preserve the old image id for later
    const oldImgId = req.user.ImageId;

    // Save the new image
    const result = await Image.save(
      req,
      __dirname + '/./../../images/profiles'
    );

    // Check if image was saved
    if (!result.success) return res.status(500).json(result);

    // Link the new image to the user
    await req.user.setImage(result.image);

    // Remove the previous image with the preserved id
    if (oldImgId) await Image.remove(oldImgId, true);

    res.json({ title: 'picture.updated', msg: 'user.imageUpdated' });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

/**
 * Updates the password of the user associated to token
 */
Users.put('/public/password/reset/:token', async (req, res) => {
  try {
    // Check if the password and confirm password are the same
    if (req.body.password !== req.body.cpassword)
      return res
        .status(500)
        .json({ title: 'request.error', msg: 'request.error' });

    // Get the password reset
    let pwdReset = await db.PasswordReset.findOne({
      where: { token: req.params.token },
      include: [{ model: db.User, attributes: ['id', 'password'] }],
    });

    // Check if the password reset exists
    if (!pwdReset)
      return res
        .status(404)
        .json({ title: 'token.notFound', msg: 'token.notFound' });

    // Create Date object at expiration date
    let tokenExpiration = new Date(pwdReset.createdAt);
    tokenExpiration.setDate(
      tokenExpiration.getDate() + pwdReset.expirationDays
    );

    // Check if token is expired
    if (tokenExpiration < new Date())
      return res
        .status(500)
        .json({ title: 'token.expired', msg: 'token.expiredPwd' });

    await db.sequelize.transaction(async (t: any) => {
      // Hash and update the user password
      let user = pwdReset.User;
      const salt = bcrypt.genSaltSync(10);
      const password = bcrypt.hashSync(req.body.password, salt);
      user.password = password;
      await user.save({ transaction: t });

      // Delete the password reset request
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

/**
 * Registers a new user.
 */
Users.post('/register', async (req, res) => {
  try {
    const { email, firstname, lastname, phone } = req.body;

    // Check if required fields exist
    if (!(email && firstname && lastname && phone && req.body.password))
      return res
        .status(500)
        .json({ title: 'request.missingField', msg: 'request.missingField' });

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.password, salt);

    const user = await db.User.create({
      email,
      password,
      firstname,
      lastname,
      phone,
    });

    //  Check if user was created
    if (user) {
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

/**
 * Sends a password reset url to the specified email, if it exists
 */
Users.post('/public/password/reset', async (req, res) => {
  try {
    // Check if email is valid
    if (
      !req.body.email ||
      !req.body.email.length ||
      !req.body.email.includes('@')
    )
      return res
        .status(500)
        .json({ title: 'form.email.error', msg: 'form.error.email.valid' });

    // Get user with email
    let user = await db.User.findOne({ where: { email: req.body.email } });
    if (!user)
      return res
        .status(404)
        .json({ title: 'user.notFound', msg: 'user.notAssociatedToEmail' });

    // Create token
    const token = Global.createToken(4);
    const pwdReset = await db.sequelize.transaction(async (t: any) => {
      // Delete all password reset requests associated to user
      await db.PasswordReset.destroy(
        {
          where: { userId: user.id },
          force: true,
        },
        { transaction: t }
      );

      // Create a new one with the new token
      return await db.PasswordReset.create(
        {
          userId: user.id,
          token: token,
        },
        { transaction: t }
      );
    });

    // Read and format the HTML to be sent in the email
    const emailHTML = await Global.readHTML(
      __dirname + '/_html/passwordReset.html'
    );
    if (!emailHTML) throw 'Could not read HTML.';

    const formattedEmailHTML = Global.format(emailHTML, [token]);

    // Send the email
    const mailRes = await sendEmail({
      from: email.sender,
      to: req.body.email,
      subject: `Your Cotulity Password Reset Request`,
      html: formattedEmailHTML,
    });

    // Check if the email was sent
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

/**
 * Verifies a user account using token
 */
Users.put('/public/verify/:token', async (req, res) => {
  try {
    // Get verification email
    let verifEmail = await db.VerificationEmail.findOne({
      where: { token: req.params.token },
      include: [
        {
          model: db.User,
          attributes: ['id', 'firstname', 'lastname', 'emailVerifiedAt'],
        },
      ],
    });

    // Check if the token is associated to a verification email
    if (!verifEmail)
      return res.status(404).json({
        title: 'account.verificationEmail.notFound',
        msg: 'account.verificationEmail.notFound',
      });

    // Check if the user is already verified
    if (verifEmail.User.emailVerifiedAt !== null)
      return res.status(500).json({
        title: 'account.verificationEmail.alreadyVerified',
        msg: 'account.verificationEmail.alreadyVerified',
      });

    // Create Date object at expiration date
    var expirationDate = new Date(verifEmail.createdAt);
    expirationDate.setDate(
      expirationDate.getDate() + verifEmail.expirationDays
    );

    // Check if the token is expired
    if (expirationDate < new Date())
      return res.status(500).json({
        title: 'account.verificationEmail.expired',
        msg: 'account.verificationEmail.expired',
      });

    // Verify user email
    let user = verifEmail.User;
    user.emailVerifiedAt = new Date();
    await user.save();

    // Create a backup user for financial records
    await db.UserRecord.create({
      userId: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
    });

    return res.json({
      title: 'account.verificationEmail.verified',
      msg: 'account.verificationEmail.verified',
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

/**
 * Deletes the profile picture of the connected user.
 */
Users.delete('/current/picture', async (req: any, res: any) => {
  try {
    // Check if user has an image
    if (!req.user.ImageId)
      return res
        .status(404)
        .json({ title: 'picture.couldNotDelete', msg: 'user.imageNotFound' });

    const imgId = req.user.ImageId;

    // Unlink image from user
    await req.user.setImage(null);

    // Delete the image physically
    const result = await Image.remove(imgId, true);

    // Check if the image was deleted
    if (!result.success) return res.status(500).json(result);

    res.json({ title: 'picture.deleted', msg: 'user.imageDeleted' });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

/**
 * Deletes the logged in user
 */
Users.delete('/delete', async (req: any, res: any) => {
  try {
    // Check if the request has a user
    if (!req.user)
      return res
        .status(500)
        .json({ title: 'request.error', msg: 'request.error' });

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
      )
        .then(async () => {
          // Delete notifications
          await db.Notification.destroy(
            {
              where: { toId: req.user.id },
              force: true,
            },
            { transaction: t }
          );
        })
        .then(async () => {
          // Delete homes groceries
          await db.Grocery.destroy(
            { where: { homeId: homeIds }, force: true },
            { transaction: t }
          );
        })
        .then(async () => {
          // Delete homes task occurences
          let taskOccurences = db.TaskOccurence.findAll({
            include: [
              { model: db.Task, as: 'Task', where: { homeId: homeIds } },
            ],
          });

          if (taskOccurences?.length)
            await db.TaskOccurence.destroy(
              {
                where: { id: taskOccurences.map((to: any) => to.id) },
                force: true,
              },
              { transaction: t }
            );
        })
        .then(async () => {
          // Delete homes tasks
          await db.Task.destroy(
            { where: { homeId: homeIds }, force: true },
            { transaction: t }
          );
        })
        .then(async () => {
          // Delete homes expenses splits
          let expenseSplits = db.ExpenseSplit.findAll({
            include: [{ model: db.Expense, where: { homeId: homeIds } }],
          });

          if (expenseSplits?.length)
            await db.ExpenseSplit.destroy(
              {
                where: { id: expenseSplits.map((es: any) => es.id) },
                force: true,
              },
              { transaction: t }
            );
        })
        .then(async () => {
          // Delete homes expenses
          await db.Expense.destroy(
            { where: { homeId: homeIds }, force: true },
            { transaction: t }
          );
        })
        .then(async () => {
          // Delete homes transfers
          await db.Transfer.destroy(
            { where: { homeId: homeIds }, force: true },
            { transaction: t }
          );
        })
        .then(async () => {
          // Delete homes users
          await db.HomeUser.destroy(
            {
              where: { homeId: homeIds },
              force: true,
            },
            { transaction: t }
          );
        })
        .then(async () => {
          // Delete homes
          await db.Home.destroy(
            { where: { id: homeIds }, force: true },
            { transaction: t }
          );
        })
        .then(async () => {
          // Remove user id from user record, but keep firstname and lastname
          let userRecord = await db.UserRecord.findOne(
            {
              where: { userId: req.user.id },
            },
            { transaction: t }
          );

          if (userRecord) {
            userRecord.userId = null;
            await userRecord.save();
          }
        })
        .then(async () => {
          // Delete user
          await req.user.destroy(
            { force: true },
            { transaction: t, individualHooks: true }
          );
        });

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
