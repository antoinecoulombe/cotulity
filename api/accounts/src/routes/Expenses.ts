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

// Get all expenses
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

// Get all expenses
Expenses.get('/total/year', async (req: any, res: any) => {
  try {
    let oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

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

// Create a new expense
Expenses.post('/', async (req: any, res: any) => {
  try {
    let date = InputsToDate(req.body.date);

    if (!req.body.description || !date)
      return res
        .status(500)
        .json({ title: 'request.missingField', msg: 'request.missingField' });

    if (isNaN(req.body.amount) || req.body.amount < 0.01)
      return res.status(500).json({
        title: 'expenses.invalidAmount',
        msg: 'expenses.amountOverZero',
      });

    if (!req.body.Users || !Array.isArray(req.body.Users))
      return res
        .status(500)
        .json({ title: 'expenses.noUsers', msg: 'expenses.noUsers' });

    let membersIds = (
      await res.locals.home.getMembers({
        attributes: ['id'],
      })
    ).map((m: any) => m.id);

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

      let amountEach = req.body.amount / (req.body.Users.length + 1);
      let splits = req.body.Users.map((u: ExpenseUser) => {
        return { expenseId: expense.id, amount: amountEach, userId: u.id };
      });

      if (
        req.body.Users.filter((u: ExpenseUser) => u.id === req.user.id)
          .length === 0
      )
        splits.push({
          expenseId: expense.id,
          amount: amountEach,
          userId: req.user.id,
        });

      await db.ExpenseSplit.createBulk(splits, { transaction: t });

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
