import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';

const Accounts = express.Router();
const db = require('../../../shared/db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

/**
 * Verifies that the app is online.
 */
Accounts.use(async (req: any, res, next) => {
  req.params.appname = 'accounts';
  validateApp(req, res, next);
});

// ########################################################
// ####################### Imports ########################
// ########################################################

import Transfers from './Transfers';
Accounts.use('/transfers', Transfers);

import Expenses from './Expenses';
Accounts.use('/expenses', Expenses);

// ########################################################
// ###################### Interfaces ######################
// ########################################################

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

/**
 * Gets the current home users.
 * @param res The HTTP response.
 * @returns An array containing the home users.
 */
export const getUsers = async (res: any) => {
  return await res.locals.home.getMembers({
    attributes: ['id', 'firstname', 'lastname'],
    include: [{ model: db.Image, attributes: ['url'] }],
    through: { where: { accepted: true } },
  });
};

/**
 * Reorders the sender and receiver of an amount to avoid duplicated in database.
 * @param from The sender of the amount.
 * @param to The receiver of the amount.
 * @param amount The amount to be sent.
 * @returns An object containing the sender and receiver id, as well as the amount.
 * If the sender id (from) is bigger than the receiver id (to), they are switched and the amount
 * is reversed (ie: 50 becomes -50).
 */
const orderHomeDebt = (
  from: number,
  to: number,
  amount: number
): { fromId: number; toId: number; amount: number } => {
  if (from < to) return { fromId: from, toId: to, amount: -amount };
  return { fromId: to, toId: from, amount: amount };
};

/**
 * Adjusts debt between members by the specified amount.
 * @param from The sender of the amount.
 * @param to The receiver of the amount.
 * @param amount The amount to be sent.
 * @param homeId The home id by which the home debt should be found.
 * @param transaction A sequelize transaction object.
 */
export const settleHomeDebt = async (
  from: number,
  to: number,
  amount: number,
  homeId: number,
  transaction?: any
): Promise<void> => {
  let hd = orderHomeDebt(from, to, amount); // Reverse sender and receiver if needed

  // Find the home debt between the two members
  let homeDebt = await db.HomeDebt.findOne({
    where: { homeId: homeId, fromId: hd.fromId, toId: hd.toId },
  });

  // If no debt between the two member is found, create one
  if (!homeDebt)
    await db.HomeDebt.create(
      { ...hd, homeId: homeId },
      transaction ? { transaction: transaction } : {}
    );
  else {
    homeDebt.amount += hd.amount; // Add the amount to the debt
    await homeDebt.save(transaction ? { transaction: transaction } : {});
  }
};

// ########################################################
// ######################### GET ##########################
// ########################################################

/**
 * Gets all home users with expenses and transfers.
 */
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

/**
 * Gets all home debts.
 */
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
