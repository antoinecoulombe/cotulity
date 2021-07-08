import express from 'express';

const Apps = express.Router();
const db = require('../db/models');

const validateHome = async (req: any, res: any, next: any) => {
  try {
    if (!req.params.homeId)
      return next({ title: 'request.notFound', msg: 'request.notFound' });

    const home = await req.user.getHomes({
      where: { id: req.params.homeId },
    });

    if (home.length === 0)
      return next({ title: 'request.notFound', msg: 'request.notFound' });

    return next();
  } catch (error) {
    console.log(error);
    return next({ title: 'request.error', msg: 'request.error' });
  }
};

const validateApp = async (req: any, res: any, next: any) => {
  try {
    if (!req.params.appName)
      return next({ title: 'request.notFound', msg: 'request.notFound' });

    const app = await db.App.findOne({ where: { name: req.params.appName } });

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

Apps.get('/:appName/', validateApp, (req, res) => {
  res.json({ title: 'request.authorized' });
});

Apps.get('/:appName/:homeId/', validateApp, validateHome, (req, res) => {
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
