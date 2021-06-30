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
    res.json({ title: 'request.error', msg: 'request.error' });
  }
});

Notifications.delete(
  '/notifications/delete/:id',
  async (req: any, res: any) => {
    try {
      const notification = await db.Notification.findOne({
        where: { toId: req.user.id, id: req.params.id },
      });

      if (!notification)
        return res
          .status(404)
          .json({ title: 'request.notFound', msg: 'request.notFound' });

      notification.destroy();
      return res.json({ title: 'request.success', msg: 'request.success' });
    } catch (error) {
      console.log(error);
      res.json({ title: 'request.error', msg: 'request.error' });
    }
  }
);

export default Notifications;
