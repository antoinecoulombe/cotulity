var app = require('./app');

// Express Start
app.listen(app.get('port'), () => {
  return console.log(`homes: server is listening on ${app.get('port')}`);
});