var app = require('./app');
require('./routes/_utils/CronJobs');

// Express Start
app.listen(app.get('port'), () => {
  return console.log(
    `groceries: server is listening on port ${app.get('port')}`
  );
});
