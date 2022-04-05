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

const orderHomeDebt = (
  from: number,
  to: number,
  amount: number
): { fromId: number; toId: number; amount: number } => {
  if (from < to) return { fromId: from, toId: to, amount: -amount };
  return { fromId: to, toId: from, amount: amount };
};

export const settleHomeDebt = async (
  from: number,
  to: number,
  amount: number,
  homeId: number,
  t?: any
): Promise<void> => {
  let hd = orderHomeDebt(from, to, amount);
  let homeDebt = await db.HomeDebt.findOne({
    where: { homeId: homeId, fromId: hd.fromId, toId: hd.toId },
  });

  if (!homeDebt)
    await db.HomeDebt.create(
      { ...hd, homeId: homeId },
      t ? { transaction: t } : {}
    );
  else {
    homeDebt.amount += hd.amount;
    await homeDebt.save(t ? { transaction: t } : {});
  }
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
                attributes: ['amount'],
              },
            },
          ],
        },
        {
          model: db.Transfer,
          as: 'TransferSent',
          attributes: ['date', 'amount', 'toUserId'],
        },
        {
          model: db.Transfer,
          as: 'TransferReceived',
          attributes: ['date', 'amount', 'fromUserId'],
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

// Get all home debts
Accounts.get('/debts', async (req: any, res: any) => {
  try {
    return res.json({
      title: 'request.success',
      msg: 'request.success',
      debts: await res.locals.home.getHomeDebts(),
      users: await getUsers(res),
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
