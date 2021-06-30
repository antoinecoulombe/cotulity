import express from 'express';
import bodyParser from 'body-parser';

const Notifications = express.Router();

const db = require('../db/models');

Notifications.get('/', async (req: any, res: any) => {
  try {
    const notifications = await db.Notification.findAll({
      order: [['createdAt', 'ASC']],
      where: { toId: req.user.id },
      attributes: ['id', 'title', ['description', 'msg']],
      include: {
        model: db.NotificationType,
        as: 'type',
        required: true,
        attributes: ['name', 'showTime'],
      },
    });
    res.json(notifications);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

export default Notifications;
