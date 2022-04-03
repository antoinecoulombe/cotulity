import express from 'express';
import { validateApp } from '../../../shared/src/routes/Apps';
import { InputsToDate } from '../../../shared/src/routes/Global';
import { getUsers, settleHomeDebt } from './Accounts';

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

    let transfer = await db.sequelize.transaction(async (t: any) => {
      let transferDb = await db.Transfer.create(
        {
          homeId: res.locals.home.id,
          fromUserId: req.user.id,
          toUserId: req.body.userId,
          amount: req.body.amount,
        },
        { transaction: t }
      );

      await settleHomeDebt(
        req.user.id,
        req.body.userId,
        req.body.amount,
        res.locals.home.id,
        t
      );

      return transferDb;
    });

    return res.status(501).json({
      title: 'transfers.created',
      msg: 'transfers.created',
      transfer: transfer,
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
