var app = require('./app');
require('./routes/_utils/CronJobs');

/**
 * Starts Express
 */
app.listen(app.get('port'), () => {
  return console.log(
    `GROCERIES: server is listening on port ${app.get('port')} (${
      process.env.NODE_ENV
    } environment)`
  );
});
