import express from 'express';
import { validateApp } from '../../../shared/src/Apps';

const Groceries = express.Router();
const db = require('../../../shared/db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

Groceries.use(async (req: any, res, next) => {
  req.params.appname = 'groceries';
  validateApp(req, res, next);
});

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

// ########################################################
// ######################### GET ##########################
// ########################################################

Groceries.get('/', async (req: any, res: any) => {
  try {
    const articles = await res.locals.home.getGroceries({ paranoid: false });

    res.json({
      title: 'request.success',
      msg: 'request.success',
      articles: JSON.parse(
        JSON.stringify(articles, ['id', 'description', 'deletedAt'])
      ),
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

Groceries.put('/:id/:action', async (req: any, res: any) => {
  try {
    const actions = ['delete', 'restore'];
    const action = req.params.action;
    if (!action || !actions.includes(action))
      return res
        .status(404)
        .json({ title: 'request.notFound', msg: 'request.notFound' });

    const grocery = await res.locals.home.getGroceries({
      where: { id: req.params.id },
      paranoid: false,
    });
    if (!grocery.length)
      return res
        .status(404)
        .json({ title: 'groceries.notFound', msg: 'groceries.notFound' });

    if (req.params.action == 'delete') await grocery[0].destroy();
    else if (req.params.action == 'restore') await grocery[0].restore();

    res.json({
      title: 'request.success',
      msg: 'request.success',
      article: JSON.parse(
        JSON.stringify(grocery[0], ['id', 'description', 'deletedAt'])
      ),
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({
      title: `groceries.${req.params.action}`,
      msg: 'request.error',
    });
  }
});

// ########################################################
// ######################### POST #########################
// ########################################################

Groceries.post('/', async (req: any, res: any) => {
  try {
    if (!req.body.description || !req.body.description.trim().length)
      return res
        .status(500)
        .json({ title: 'groceries.error.add', msg: 'groceries.descInvalid' });

    const article = await db.Grocery.create({
      ownerId: req.user.id,
      homeId: res.locals.home.id,
      description: req.body.description,
    });

    res.json({
      title: 'groceries.added',
      msg: 'groceries.added',
      article: JSON.parse(JSON.stringify(article, ['id', 'description'])),
    });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################## DELETE ########################
// ########################################################

Groceries.delete('/:id', async (req: any, res: any) => {
  try {
    const grocery = await res.locals.home.getGroceries({
      where: { id: req.params.id },
      paranoid: false,
    });
    if (!grocery.length)
      return res
        .status(404)
        .json({ title: 'groceries.notFound', msg: 'groceries.notFound' });

    await grocery[0].destroy({ force: true });

    res.json({ title: 'groceries.deleted', msg: 'groceries.deleted' });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Groceries;
