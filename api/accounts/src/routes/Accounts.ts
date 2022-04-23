import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';
import { groupBy } from '../../../shared/src/routes/Global';
import { getHomeUsers } from '../../../shared/src/routes/Homes';

const Accounts = express.Router();
const db = require('../../../shared/db/models');
const { Op } = require('sequelize');

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
  homeId?: number;
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
 * Sums all debts for each user.
 * @param groupedDebt The Debt array grouped using Global.groupBy.
 * @returns An array of objects containing all user ids and their total debts.
 */
const sumGroupedDebts = (groupedDebt: any): { id: number; total: number }[] => {
  let totals: { id: number; total: number }[] = [];

  for (const [userId, subDebts] of Object.entries(groupedDebt)) {
    let total = 0;

    (subDebts as HomeDebt[]).forEach((sd: HomeDebt) => (total += sd.amount));
    totals.push({ id: parseInt(userId), total: total });
  }

  return totals;
};

/**
 * Sums all debts and compounds them.
 * @param debts The Debts to be compounded.
 * @returns An array of objects containing the user id and
 * its debt, either negative or positive.
 */
const getCompoundedDebts = (
  debts: HomeDebt[]
): { id: number; total: number }[] => {
  let owes = sumGroupedDebts(groupBy(debts, 'fromUserId'));
  let isOwed = sumGroupedDebts(groupBy(debts, 'toUserId'));
  let totals = [...owes];

  isOwed.forEach((is) => {
    let t = totals.find((t) => t.id === is.id);
    if (!t) totals.push({ id: is.id, total: -is.total });
    else t.total -= is.total;
  });

  return totals;
};

/**
 * Gets the minimal amount of transfers needed to settle all home debts.
 * @param totals The compounded debts array.
 * @returns An array containing all transfers needed to settle all home debts.
 */
const getCompoundedTransfers = (
  totals: { id: number; total: number }[]
): HomeDebt[] => {
  let totalsOwed: { id: number; total: number }[] = [];
  let totalsOwes: { id: number; total: number }[] = [];

  totals.sort((a, b) => b.total - a.total);

  totals.forEach((t) => {
    if (t.total < 0) totalsOwed.push(t);
    else if (t.total > 0) totalsOwes.push(t);
  });

  let transfers: HomeDebt[] = [];

  totalsOwed.forEach((to) => {
    let owed = to.total;

    totalsOwes.every((tos) => {
      let toTransfer = -owed > tos.total ? tos.total : -owed;

      transfers.push({
        fromUserId: tos.id,
        toUserId: to.id,
        amount: toTransfer,
      });
      tos.total -= toTransfer;
      to.total += toTransfer;

      if (to.total == 0) return false;
      return true;
    });
  });

  return transfers;
};

/**
 * Gets the minimal amount of transfers needed to settle all home debts.
 * @param debts The home debts array.
 * @returns An array containing all transfers needed to settle all home debts.
 */
const getMinimumTransfers = (debts: HomeDebt[]): HomeDebt[] =>
  getCompoundedTransfers(getCompoundedDebts(debts));

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

      let newAmount =
        parseFloat(od.amount.toString()) + parseFloat(debtDb.amount);

      // Otherwise, sum the amounts
      return {
        ...od,
        amount: newAmount,
      };
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
              where: { amount: { [Op.not]: 0 } },
            },
            {
              model: db.HomeDebt,
              as: 'toDebt',
              where: { amount: { [Op.not]: 0 } },
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
        where: { amount: { [Op.not]: 0 } },
      }),
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

/**
 * Gets the minimum amount of home debts (compound transfers).
 */
Accounts.get('/debts/compound', async (req: any, res: any) => {
  try {
    let debts = await res.locals.home.getHomeDebts();

    return res.json({
      title: 'request.success',
      msg: 'request.success',
      debts: getMinimumTransfers(debts),
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
      users: await getHomeUsers(db, res),
      debts: await res.locals.home.getHomeDebts({
        attributes: ['fromUserId', 'toUserId', 'amount'],
        where: { amount: { [Op.not]: 0 } },
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
