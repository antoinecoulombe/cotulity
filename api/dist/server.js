"use strict";
var app = require('./app');
require('./routes/_utils/CronJobs');
// Express Start
app.listen(app.get('port'), () => {
    return console.log(`server is listening on ${app.get('port')}`);
});
