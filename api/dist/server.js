"use strict";
const app = require('./app.js');
require('./routes/_utils/CronJobs');
// Express Start
app.listen(app.get('port'), () => {
    return console.log(`server is listening on ${app.get('port')}`);
});