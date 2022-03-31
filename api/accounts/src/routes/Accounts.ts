import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';

const Accounts = express.Router();
const db = require('../../../shared/db/models');
const { Op } = require('sequelize');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

Accounts.use(async (req: any, res, next) => {
  req.params.appname = 'accounts';
  validateApp(req, res, next);
});

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

export const getUsers = async (res: any) => {
  return await res.locals.home.getMembers({
    attributes: ['id', 'firstname', 'lastname'],
    include: [{ model: db.Image, attributes: ['url'] }],
    through: { where: { accepted: true } },
  });
};

// ########################################################
// ######################### GET ##########################
// ########################################################

// Get all home users with expenses and transfers
Accounts.get('/users', async (req: any, res: any) => {
  try {
    let users = await res.locals.home.getMembers({
      attributes: ['id', 'firstname', 'lastname'],
      include: [
        { model: db.Image, attributes: ['url'] },
        {
          model: db.Expense,
          attributes: ['description', 'date', 'totalAmount'],
          include: [
            {
              model: db.User,
              as: 'SplittedWith',
              attributes: ['id'],
              through: {
                attributes: ['amount', 'settledAmount', 'settled'],
              },
            },
          ],
        },
        {
          model: db.Transfer,
          as: 'TransferSent',
          attributes: ['date', 'amount', 'toUserId', 'correction'],
        },
        {
          model: db.Transfer,
          as: 'TransferReceived',
          attributes: ['date', 'amount', 'fromUserId', 'correction'],
        },
      ],
      through: {
        where: { accepted: true },
      },
    });

    return res.json({
      title: 'request.success',
      msg: 'request.success',
      users: users,
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// ########################################################
// ######################### POST #########################
// ########################################################

// ########################################################
// ######################## DELETE ########################
// ########################################################

export default Accounts;
