import express from 'express';

const Notifications = express.Router();
const db = require('../db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

export async function deleteNotificationsToUser(
  user: any,
  transaction: any
): Promise<{ success: boolean; title: string; msg: string }> {
  try {
    await db.Notification.destroy(
      { where: { toId: user.id } },
      { transaction: transaction }
    );
    return { success: true, title: 'request.success', msg: 'request.success' };
  } catch (error) {
    console.log(error);
    return { success: false, title: 'request.error', msg: 'request.error' };
  }
}

// ########################################################
// ######################### GET ##########################
// ########################################################

// Get all notifications linked to the connected user.
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
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// ########################################################
// ######################### POST #########################
// ########################################################

// ########################################################
// ######################## DELETE ########################
// ########################################################

// Deletes the notification with the specified id.
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
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Notifications;
