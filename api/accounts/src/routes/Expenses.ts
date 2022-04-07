import express from 'express';
import { InputsToDate } from '../../../shared/src/routes/Global';
import { getUsers, settleHomeDebt } from './Accounts';

const Expenses = express.Router();
const db = require('../../../shared/db/models');
const { Op } = require('sequelize');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// ########################################################
// ###################### Interfaces ######################
// ########################################################

interface ExpenseUser {
  id: number;
  firstname: string;
  lastname: string;
  img: null | { url: string };
}

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

/**
 * Gets all home expenses.
 * @param res The HTTP response.
 * @returns An array containing the home expenses.
 */
const getExpenses = async (res: any) => {
  return await res.locals.home.getExpenses({
    attributes: ['id', 'paidByUserId', 'description', 'date', 'totalAmount'],
    include: [
      {
        model: db.ExpenseSplit,
        attributes: ['userId', 'amount'],
      },
    ],
  });
};

// ########################################################
// ######################### GET ##########################
// ########################################################

/**
 * Gets all expenses.
 */
Expenses.get('/', async (req: any, res: any) => {
  try {
    return res.json({
      title: 'request.success',
      msg: 'request.success',
      expenses: await getExpenses(res),
      users: await getUsers(res),
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

/**
 * Gets the expenses total amount, for the past year.
 */
Expenses.get('/total/year', async (req: any, res: any) => {
  try {
    // Get the date from one year ago
    let oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Sum all expenses amount since then
    let total = await db.Expense.sum('totalAmount', {
      where: { homeId: res.locals.home.id, date: { [Op.gte]: oneYearAgo } },
    });

    return res.json({
      title: 'request.success',
      msg: 'request.success',
      total: total,
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
 * Creates a new expense and settles debts.
 */
Expenses.post('/', async (req: any, res: any) => {
  try {
    let date = InputsToDate(req.body.date);

    // Check if the description and date are valid
    if (!req.body.description || !date)
      return res
        .status(500)
        .json({ title: 'request.missingField', msg: 'request.missingField' });

    // Check if the amount is valid
    if (isNaN(req.body.amount) || req.body.amount < 0.01)
      return res.status(500).json({
        title: 'expenses.invalidAmount',
        msg: 'expenses.amountOverZero',
      });

    // Check if the expense has users
    if (!req.body.Users || !Array.isArray(req.body.Users))
      return res
        .status(500)
        .json({ title: 'expenses.noUsers', msg: 'expenses.noUsers' });

    // Get the ids of all home members
    let membersIds = (
      await res.locals.home.getMembers({
        attributes: ['id'],
      })
    ).map((m: any) => m.id);

    // Check if all expense users are home members
    if (
      req.body.Users.filter((u: any) => !membersIds.includes(u.id)).length > 0
    )
      return res.status(500).json({
        title: 'expenses.userNotInHome',
        msg: 'expenses.userNotInHome',
      });

    return await db.sequelize.transaction(async (t: any) => {
      let expense = db.Expense.create(
        {
          homeId: res.locals.home.id,
          paidByUserId: req.user.id,
          description: req.body.description,
          date: date,
          totalAmount: req.body.amount,
        },
        { transaction: t }
      );

      // Create an expense split for each expense user
      let amountEach = req.body.amount / req.body.Users.length;
      await db.ExpenseSplit.createBulk(
        req.body.Users.map((u: ExpenseUser) => {
          return { expenseId: expense.id, amount: amountEach, userId: u.id };
        }),
        { transaction: t }
      );

      // Settle home debts for all expense users
      await req.body.Users.forEach(async (u: ExpenseUser) => {
        await settleHomeDebt(
          req.user.id,
          u.id,
          -amountEach,
          res.locals.home.id,
          t
        );
      });

      return res.json({
        title: 'expenses.created',
        msg: 'expenses.created',
        expense: { ...expense, ExpenseSplits: req.body.Users },
      });
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

export default Expenses;
