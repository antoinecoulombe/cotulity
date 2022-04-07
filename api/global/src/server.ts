var app = require('./app');

/**
 * Starts Express
 */
app.listen(app.get('port'), () => {
  return console.log(
    `GLOBAL: server is listening on port ${app.get('port')} (${
      process.env.NODE_ENV
    } environment)`
  );
});
