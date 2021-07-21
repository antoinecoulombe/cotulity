const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const readFile = promisify(fs.readFile);
const db = require('../../db/models');

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

export function format(string: string, params: string[]) {
  var str = string;

  for (var i = 0; i < arguments[1].length; i++) {
    var regEx = new RegExp('\\{' + i + '\\}', 'gm');
    str = str.replace(regEx, params[i]);
  }

  return str;
}

export async function readHtml(p: string) {
  return await readFile(path.join(__dirname, p), 'utf8');
}

export function respondHtml(res: any, html: string, code?: number) {
  res.writeHead(code ?? 200, {
    'Content-Type': 'text/html',
    'Content-Length': html.length,
  });
  res.write(html);
  res.end();
}
