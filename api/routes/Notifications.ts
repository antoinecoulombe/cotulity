import express from 'express';

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
    await notifications.forEach((n: any) => (n.dataValues.db = true));
    res.json(notifications);
  } catch (error) {
    console.log(error);
    res.json({ title: 'request.error', msg: 'request.error' });
  }
});

Notifications.delete('/delete/:id', async (req: any, res: any) => {
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
});

export async function sendNotifications(
  userIds: number[],
  notification: any,
  transaction?: any
) {
  function getNotification(toId: number, notification: any) {
    notification.toId = toId;
    return notification;
  }

  let notifications: any[] = [];
  userIds.forEach((id: number) =>
    notifications.push(getNotification(id, notification))
  );

  await db.Notification.bulkCreate(notifications, { transaction: transaction });
}

export default Notifications;
