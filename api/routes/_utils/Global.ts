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
  const notifications = userIds.map((id: number) => {
    return { ...notification, toId: id };
  });

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

// Generates a random token.
export function createToken(relativeLength: number) {
  let token = Math.random().toString(36).substring(2, 15);
  for (let i = 0; i < relativeLength - 1; ++i)
    token += Math.random().toString(36).substring(2, 15);
  return token;
}

// Generates a random token asynchronously.
export async function createTokenAsync(relativeLength: number) {
  let token = Math.random().toString(36).substring(2, 15);
  for (let i = 0; i < relativeLength - 1; ++i)
    token += Math.random().toString(36).substring(2, 15);
  return token;
}
