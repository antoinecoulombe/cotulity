import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';
import { InputsToDate } from '../../../shared/src/routes/Global';
import { getUsers } from './Accounts';

const Transfers = express.Router();
const db = require('../../../shared/db/models');
const { Op } = require('sequelize');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

Transfers.use(async (req: any, res, next) => {
  req.params.appname = 'accounts';
  validateApp(req, res, next);
});

// ########################################################
// ##################### Interfaces #######################
// ########################################################

interface ExpenseSplit {
  ExpenseId: number;
  userId: number;
  amount: number;
  settledAmount: number;
  settled: boolean;
  Expense: {
    id: number;
    paidByUserId: number;
    totalAmount: number;
  };
  save: () => any;
}

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

const getTransfers = async (res: any, withCorrections?: boolean) => {
  return await res.locals.home.getTransfers({
    where: { correction: withCorrections ? { [Op.or]: [true, false] } : false },
    attributes: ['id', 'fromUserId', 'toUserId', 'date', 'amount'],
  });
};

const distributeAmount = async (
  expenses: ExpenseSplit[],
  toDistribute: number
): Promise<number> => {
  if (!expenses || !expenses.length) return toDistribute;

  for (let i = 0; i < expenses.length; ++i) {
    if (toDistribute <= 0) break;

    let e = expenses[i];
    let toSettle = e.amount - e.settledAmount;
    if (toDistribute >= toSettle) {
      e.settledAmount = e.amount;
      e.settled = true;
      toDistribute -= toSettle;
      await e.save();
    } else {
      e.settledAmount += toDistribute;
      await e.save();
      return 0;
    }
  }

  return toDistribute;
};

// ########################################################
// ######################### GET ##########################
// ########################################################

// Get all transfers
Transfers.get('/', async (req: any, res: any) => {
  try {
    return res.json({
      title: 'request.success',
      msg: 'request.success',
      transfers: await getTransfers(res),
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

// Create a new transfer
Transfers.post('/', async (req: any, res: any) => {
  try {
    let date = InputsToDate(req.body.date + '@12:00');

    if (!req.body.userId || !date || !req.body.amount)
      return res
        .status(500)
        .json({ title: 'request.missingField', msg: 'request.missingField' });

    if (isNaN(req.body.amount) || req.body.amount < 0.01)
      return res.status(500).json({
        title: 'transfers.invalidAmount',
        msg: 'transfers.amountOverZero',
      });

    let members = await res.locals.home.getMembers({
      attributes: ['id', 'firstname', 'lastname'],
      include: [
        {
          model: db.Image,
          as: 'Image',
          attributes: ['url'],
        },
      ],
    });

    if (members.filter((m: any) => m.id === req.body.userId).length() === 0)
      return res
        .status(404)
        .json({ title: 'users.notFound', msg: 'transfers.userNotFound' });

    await db.Transfer.create({
      homeId: res.locals.home,
      fromUserId: req.user.id,
      toUserId: req.body.userId,
      amount: req.body.amount,
    });

    // TODO: Settle expenses

    let notSettled = db.ExpenseSplit.findAll({
      where: { userId: req.body.userId, settled: false },
      include: [
        {
          model: db.Expense,
          attributes: ['id', 'paidByUserId', 'totalAmount'],
        },
      ],
    });

    let byRequester = notSettled.filter((e: ExpenseSplit) => {
      e.Expense.paidByUserId === req.user.id;
    });
    let notByRequester = notSettled.filter((e: ExpenseSplit) => {
      e.Expense.paidByUserId !== req.user.id;
    });

    let toDistribute = await distributeAmount(byRequester, req.body.amount);
    toDistribute -= await distributeAmount(notByRequester, toDistribute);

    // settle expenses byRequester first
    // then, while amount > 0, settle expenses by other members

    return res.status(501).json({
      title: 'transfers.created',
      msg: 'transfers.created',
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

export default Transfers;
