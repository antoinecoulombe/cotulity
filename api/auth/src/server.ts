var app = require('./app');

// Express Start
app.listen(app.get('port'), () => {
  return console.log(`auth: server is listening on port ${app.get('port')}`);
});
