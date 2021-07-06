import express from 'express';

const Apps = express.Router();
const db = require('../db/models');

const validateApp = async (req: any, res: any, next: any) => {
  try {
    if (!req.params.name)
      return next({ title: 'request.notFound', msg: 'request.notFound' });

    const app = await db.App.findOne({ where: { name: req.params.name } });

    if (!app)
      return next({ title: 'request.notFound', msg: 'request.notFound' });
    if (!app.online)
      return next({ title: 'request.denied', msg: 'apps.offline' });

    return next();
  } catch (error) {
    console.log(error);
    return next({ title: 'request.error', msg: 'request.error' });
  }
};

Apps.use('/:name/', validateApp, (req, res) => {
  res.json({ title: 'request.authorized' });
});

Apps.get('/', async (req, res) => {
  try {
    const apps = await db.App.findAll({
      where: { online: true },
      attributes: ['id', 'name', 'image'],
    });
    res.json({ apps });
  } catch (e) {
    res.json({ title: 'apps.error', msg: 'request.reload' });
  }
});

export default Apps;
