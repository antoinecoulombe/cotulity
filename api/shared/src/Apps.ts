const db = require('../db/models');

// Verifies that the requested home is valid and accessible by the user.
export const validateHome = async (req: any, res: any, next: any) => {
  try {
    if (!req.params.refnumber)
      return next({ title: 'request.notFound', msg: 'request.notFound' });

    const home = await req.user.getHomes({
      where: { refNumber: req.params.refnumber },
    });

    if (!home.length)
      return next({ title: 'request.notFound', msg: 'request.notFound' });

    res.locals.home = home[0];
    return next();
  } catch (error) {
    /* istanbul ignore next */
    return next({ title: 'request.error', msg: 'request.error' });
  }
};

// Verifies that the requested application is valid and online.
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
    /* istanbul ignore next */
    return next({ title: 'request.error', msg: 'request.error' });
  }
};
