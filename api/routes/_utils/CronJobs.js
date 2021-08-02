"use strict";
var CronJob = require('cron').CronJob;
var db = require('../../db/models');
const { Op } = require('sequelize');
// Every hour (0 0 * * * *), deletes groceries older than one day.
const cronJob = new CronJob('0 0 * * * *', function () {
    const groceries = db.Grocery.destroy({
        where: {
            deletedAt: {
                [Op.lte]: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toUTCString(),
            },
        },
        force: true,
    }, { paranoid: true });
});
cronJob.start();
