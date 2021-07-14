import express from 'express';

const Apps = express.Router();
const db = require('../db/models');

export const validateHome = async (req: any, res: any, next: any) => {
  try {
    if (!req.params.refnumber)
      return next({ title: 'request.notFound', msg: 'request.notFound' });

    const home = await req.user.getHomes({
      where: { refNumber: req.params.refnumber },
    });

    if (home.length === 0)
      return next({ title: 'request.notFound', msg: 'request.notFound' });

    res.locals.home = home;
    return next();
  } catch (error) {
    console.log(error);
    return next({ title: 'request.error', msg: 'request.error' });
  }
};

export const validateApp = async (req: any, res: any, next: any) => {
  try {
    if (!req.params.appname)
      return next({ title: 'request.notFound', msg: 'request.notFound' });

    const app = await db.App.findOne({ where: { name: req.params.appname } });

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

Apps.get('/:appname/', validateApp, (req, res) => {
  res.json({ title: 'request.authorized' });
});

Apps.get('/:appname/:refnumber/', validateApp, validateHome, (req, res) => {
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

// Routes

export default Apps;
