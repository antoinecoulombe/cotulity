const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const db = require('../../db/models');

/**
 * Inserts a notification in the database for each user id specified using sequelize 'bulkCreate'.
 * @param userIds The destination user ids. These will be the ids present in the 'toId' column.
 * @param notification The notification object containing the notification type id, title and description to be inserted in the database.
 * @param transaction The sequelize transaction object.
 */
export const sendNotifications = async (
  userIds: number[],
  notification: { typeId: number; title: string; description: string },
  transaction?: any
): Promise<void> => {
  const notifications = userIds.map((id: number) => {
    return { ...notification, toId: id };
  });

  await db.Notification.bulkCreate(notifications, { transaction: transaction });
};

/**
 * Replaces '{i}' occurences in a string with substitution strings.
 * @param input The string containing the elements to replace.
 * @param substitutions The replacement for each element to replace.
 * '{i}' in the input string will be replaced by substitutions[i].
 * @returns The input string with each numbered brackets replaced, up to substitutions.length().
 */
export function format(input: string, substitutions: string[]): string {
  var str = input;

  for (var i = 0; i < arguments[1].length; i++) {
    var regEx = new RegExp('\\{' + i + '\\}', 'gm');
    str = str.replace(regEx, substitutions[i]);
  }

  return str;
}

/**
 * Reads an HTML file.
 * @param filePath The path of HTML file to read.
 * @returns A promise to return a the HTML file as a string.
 */
export const readHTML = async (filePath: string): Promise<string | null> => {
  try {
    return await readFile(filePath, 'utf8');
  } catch (error) {
    return null;
  }
};

/**
 * Sends HTML to the client.
 * @param res The HTTP response.
 * @param html The HTML code to send to the client.
 * @param statusCode The response status code. If not specified, 200 is sent.
 * @returns A boolean indicating if the response has been sent.
 */
export const sendHTML = (
  res: any,
  html: string,
  statusCode?: number
): boolean => {
  try {
    res.writeHead(statusCode ?? 200, {
      'Content-Type': 'text/html',
      'Content-Length': html.length,
    });
    res.write(html);
    res.end();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Generates a random token.
 * @param relativeLength A number indicating the gross length of the token. Each incrementation adds +- 10 characters to the token.
 * If not specified, this relativeLength is set to 4.
 * @returns A token with a length of (relativeLength * ~10).
 */
export const createToken = (relativeLength?: number): string => {
  let token = Math.random().toString(36).substring(2, 15);
  for (let i = 0; i < (relativeLength ?? 4); ++i)
    token += Math.random().toString(36).substring(2, 15);
  return token;
};

/**
 * Converts a datetime as received from frontend's double input date to a Date object.
 * @param dateString The inputs value formatted as follow: 'DD/MM@HH:mm'. ie: '09/08@20:42'.
 * @param past A boolean indicating whether or not the date returned should be in the future or past.
 * @returns A Date object at the input's value date.
 */
export const InputsToDate = (
  dateString: string,
  past?: boolean
): Date | null => {
  try {
    // 09/08@20:42
    let dateSplit = dateString.split('@');
    let dayMonth: number[] = dateSplit[0].split('/').map((x) => +x);
    let hourMinute: number[] = dateSplit[1].split(':').map((x) => +x);

    let now = new Date();
    let month = dayMonth[1] - 1;
    let year = now.getFullYear();

    // If the date should be in the past and the input date is further in the year than now, substract a year
    if (
      past &&
      (month > now.getMonth() ||
        (month == now.getMonth() && dayMonth[0] > now.getDay()))
    )
      year -= 1;
    // If the date should be in the future and the input date is before than now, add a year
    else if (
      !past &&
      (month < now.getMonth() ||
        (month == now.getMonth() && dayMonth[0] < now.getDay()))
    )
      year += 1;

    return new Date(year, month, dayMonth[0], hourMinute[0], hourMinute[1]);
  } catch (e) {
    return null;
  }
};

/**
 * Groups an array by the specified key.
 * @param xs The array to be grouped.
 * @param key The key used for grouping.
 * @returns A grouped array.
 */
export const groupBy = function (xs: any, key: string) {
  return xs.reduce(function (rv: any, x: any) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};
