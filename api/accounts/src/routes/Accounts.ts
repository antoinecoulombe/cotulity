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
// ###################### Interfaces ######################
// ########################################################

interface HomeDebt {
  fromUserId: number;
  toUserId: number;
  amount: number;
  homeId: number;
}

// ########################################################
// ####################### Imports ########################
// ########################################################

import Transfers, { getTransfers } from './Transfers';
Accounts.use('/transfers', Transfers);

import Expenses, { getExpenses } from './Expenses';
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
    include: [
      { model: db.Image, attributes: ['url'] },
      { model: db.UserRecord, attributes: ['id'] },
    ],
    through: {
      where: { accepted: true },
      attributes: ['accepted', 'nickname'],
    },
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
const orderHomeDebt = (debt: HomeDebt): HomeDebt => {
  if (debt.fromUserId < debt.toUserId) return { ...debt, amount: -debt.amount };
  return {
    homeId: debt.homeId,
    fromUserId: debt.toUserId,
    toUserId: debt.fromUserId,
    amount: debt.amount,
  };
};

/**
 * Adjusts debt between members by the specified amount.
 * @param debts The home debts to be inserted into the database.
 * Each home debt object contains the sender, receiver, home and amount to be sent.
 * @param transaction A sequelize transaction object.
 */
export const settleHomeDebts = async (
  debts: HomeDebt | HomeDebt[],
  transaction?: any
): Promise<void> => {
  // Reverse senders and receivers, if needed
  if (!Array.isArray(debts)) debts = [debts];
  let orderedDebts: HomeDebt[] = debts
    .filter((d) => d.fromUserId !== d.toUserId)
    .map((d) => orderHomeDebt(d));

  // Check if the debts array is empty
  if (!orderedDebts.length) return;

  // Sum debts if there is one between the debts members
  orderedDebts = await Promise.all(
    orderedDebts.map(async (od) => {
      // Find the home debt between the two members
      let debtDb = await db.HomeDebt.findOne({
        where: {
          homeId: od.homeId,
          fromUserId: od.fromUserId,
          toUserId: od.toUserId,
        },
      });

      // If no debt is found between the two members, the row can be inserted as is
      if (!debtDb) return od;

      // Otherwise, sum the amounts
      return { ...od, amount: od.amount + debtDb.amount };
    })
  );

  await db.HomeDebt.bulkCreate(orderedDebts, {
    fields: ['homeId', 'fromUserId', 'toUserId', 'amount'],
    updateOnDuplicate: ['amount'],
    transaction: transaction,
  });
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
          model: db.UserRecord,
          attributes: ['id'],
          include: [
            {
              model: db.Expense,
              attributes: [
                'id',
                'description',
                'date',
                'totalAmount',
                'paidByUserId',
              ],
              include: [
                {
                  model: db.UserRecord,
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
            {
              model: db.HomeDebt,
              as: 'fromDebt',
            },
            {
              model: db.HomeDebt,
              as: 'toDebt',
            },
          ],
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
    res.status(500).json({
      title: 'request.error',
      msg: 'request.error',
    });
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
      debts: await res.locals.home.getHomeDebts({
        attributes: ['fromUserId', 'toUserId', 'amount'],
      }),
      users: await getUsers(res),
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

Accounts.get('/', async (req: any, res: any) => {
  try {
    return res.json({
      title: 'request.success',
      msg: 'request.success',
      users: await getUsers(res),
      debts: await res.locals.home.getHomeDebts({
        attributes: ['fromUserId', 'toUserId', 'amount'],
      }),
      expenses: await getExpenses(res),
      transfers: await getTransfers(res),
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
