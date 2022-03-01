var app = require('./app');

// Express Start
app.listen(app.get('port'), () => {
  return console.log(
    `TASKS: server is listening on port ${app.get('port')} (${
      process.env.NODE_ENV
    } environment)`
  );
});
