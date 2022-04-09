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
    let reqTransfer = req.body.transfer;
    if (!reqTransfer)
      return res
        .status(500)
        .json({ title: 'request.error', msg: 'request.error' });

    let date = InputsToDate(reqTransfer.date + '@12:00', true);

    // Check if the receiver id, date and amount are valid
    if (!reqTransfer.User?.id || !date || !reqTransfer.amount)
      return res
        .status(500)
        .json({ title: 'request.missingField', msg: 'request.missingField' });

    // Check if the amount is a positive number
    if (isNaN(reqTransfer.amount) || reqTransfer.amount < 0.01)
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
    if (members.filter((m: any) => m.id === reqTransfer.User.id).length === 0)
      return res
        .status(404)
        .json({ title: 'users.notFound', msg: 'transfers.userNotFound' });

    // Create transfer and settle debts
    let transfer = await db.sequelize.transaction(async (t: any) => {
      let transferDb = await db.Transfer.create(
        {
          homeId: res.locals.home.id,
          fromUserId: req.user.id,
          toUserId: reqTransfer.User.id,
          amount: reqTransfer.amount,
          date: date,
        },
        { transaction: t }
      );

      await settleHomeDebt(
        req.user.id,
        reqTransfer.User.id,
        reqTransfer.amount,
        res.locals.home.id,
        t
      );

      return transferDb;
    });

    return res.json({
      title: 'transfers.created',
      msg: 'transfers.created',
      transfer: reqTransfer,
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
