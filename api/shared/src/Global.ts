const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const readFile = promisify(fs.readFile);
const db = require('../db/models');

export const sendNotifications = async (
  userIds: number[],
  notification: any,
  transaction?: any
): Promise<void> => {
  const notifications = userIds.map((id: number) => {
    return { ...notification, toId: id };
  });

  await db.Notification.bulkCreate(notifications, { transaction: transaction });
};

export function format(string: string, params: string[]): string {
  var str = string;

  for (var i = 0; i < arguments[1].length; i++) {
    var regEx = new RegExp('\\{' + i + '\\}', 'gm');
    str = str.replace(regEx, params[i]);
  }

  return str;
}

export const readHtml = async (p: string): Promise<any> => {
  return await readFile(path.join(__dirname, p), 'utf8');
};

export const respondHtml = (
  res: any,
  html: string,
  statusCode?: number
): void => {
  res.writeHead(statusCode ?? 200, {
    'Content-Type': 'text/html',
    'Content-Length': html.length,
  });
  res.write(html);
  res.end();
};

// Generates a random token.
export const createToken = (relativeLength: number): string => {
  let token = Math.random().toString(36).substring(2, 15);
  for (let i = 0; i < relativeLength - 1; ++i)
    token += Math.random().toString(36).substring(2, 15);
  return token;
};

// Generates a random token asynchronously.
export const createTokenAsync = async (
  relativeLength: number
): Promise<string> => {
  let token = Math.random().toString(36).substring(2, 15);
  for (let i = 0; i < relativeLength - 1; ++i)
    token += Math.random().toString(36).substring(2, 15);
  return token;
};
