import express from 'express';
import { InputsToDate } from '../../../shared/src/routes/Global';
import { getUsers, settleHomeDebt } from './Accounts';

const Transfers = express.Router();
const db = require('../../../shared/db/models');
const { Op } = require('sequelize');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// ########################################################
// ##################### Interfaces #######################
// ########################################################

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

/**
 * Gets all home transfers.
 * @param res The HTTP response.
 * @returns An array containing all home transfers.
 */
const getTransfers = async (res: any) => {
  return await res.locals.home.getTransfers({
    attributes: ['id', 'fromUserId', 'toUserId', 'date', 'amount'],
  });
};

// ########################################################
// ######################### GET ##########################
// ########################################################

/**
 * Gets all transfers.
 */
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

/**
 * Creates a new transfer and settles debts.
 */
Transfers.post('/', async (req: any, res: any) => {
  try {
    let date = InputsToDate(req.body.date + '@12:00');

    // Check if the receiver id, date and amount are valid
    if (!req.body.userId || !date || !req.body.amount)
      return res
        .status(500)
        .json({ title: 'request.missingField', msg: 'request.missingField' });

    // Check if the amount is a positive number
    if (isNaN(req.body.amount) || req.body.amount < 0.01)
      return res.status(500).json({
        title: 'transfers.invalidAmount',
        msg: 'transfers.amountOverZero',
      });

    // Get all home members
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

    // Check if the receiver is in home
    if (members.filter((m: any) => m.id === req.body.userId).length() === 0)
      return res
        .status(404)
        .json({ title: 'users.notFound', msg: 'transfers.userNotFound' });

    // Create transfer and settle debts
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
