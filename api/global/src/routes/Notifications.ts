import express from 'express';

const Notifications = express.Router();
const db = require('../../../shared/db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

// ########################################################
// ######################### GET ##########################
// ########################################################

/**
 * Gets all notifications linked to the connected user.
 */
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

    // Add a key to each notification indicating that it comes from the database
    // (and should therefore be deleted after being shown)
    await notifications.forEach((n: any) => (n.dataValues.db = true));
    res.json(notifications);
  } catch (error) {
    /* istanbul ignore next */
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

/**
 * Deletes the notification with the specified id.
 */
Notifications.delete('/delete/:id', async (req: any, res: any) => {
  try {
    const notification = await db.Notification.findOne({
      where: { toId: req.user.id, id: req.params.id },
    });

    if (!notification)
      return res
        .status(404)
        .json({ title: 'request.notFound', msg: 'request.notFound' });

    await notification.destroy();
    return res.json({ title: 'request.success', msg: 'request.success' });
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

export default Notifications;
