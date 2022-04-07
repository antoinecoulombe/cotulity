var CronJob = require('cron').CronJob;
const db = require('../../../../shared/db/models');
var { Op } = require('sequelize');

/**
 * Every hour (0 0 * * * *), deletes groceries older than one day.
 */
var cronJob = new CronJob('0 0 * * * *', function () {
  let oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

  const groceries = db.Grocery.destroy(
    {
      where: {
        deletedAt: {
          [Op.lte]: oneDayAgo.toUTCString(),
        },
      },
      force: true,
    },
    { paranoid: true }
  );
});

cronJob.start();
