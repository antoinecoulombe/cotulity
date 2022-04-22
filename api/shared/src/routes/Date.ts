/**
 * Gets all occurences of a Date until 'untilDate'.
 * @param dueDate The date of the first occurence.
 * @param repeat The frequency. Either 'day', 'week', 'twoweek' or 'month'.
 * @param untilDate The date of the last occurence.
 * @returns A string array containing the occurences, as UTC strings.
 */
export const getRepeatingDatesUntil = (
  dueDate: Date,
  repeat?: string,
  untilDate?: Date | null
): Date[] => {
  let occurences: Date[] = [];
  occurences.push(new Date(dueDate));

  // Check if task repeats
  if (repeat && untilDate && repeat !== 'none') {
    let valid: boolean = true;
    let untilMilliseconds = untilDate.getTime();
    let dueMilliseconds = dueDate.getTime();

    // While task occurence is before 'untilDate', with a limit of 50 occurences
    while (dueMilliseconds <= untilMilliseconds && occurences.length < 50) {
      switch (repeat) {
        case 'day':
          dueDate.setDate(dueDate.getDate() + 1);
          break;
        case 'week':
          dueDate.setDate(dueDate.getDate() + 7);
          break;
        case 'twoweek':
          dueDate.setDate(dueDate.getDate() + 14);
          break;
        case 'month':
          dueDate.setMonth(dueDate.getMonth() + 1);
          break;
        default:
          valid = false;
          break;
      }

      dueMilliseconds = dueDate.getTime();

      // Make sure the task occurence is before 'untilDate'
      if (!valid || dueMilliseconds > untilMilliseconds) break;

      occurences.push(new Date(dueDate));
    }
  }

  return occurences;
};

/**
 * Calculates the difference in days between two dates.
 * @param a The sooner date.
 * @param b The later date.
 * @returns The difference in days.
 */
export function dateDiffInDays(a: Date, b: Date) {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor(((utc2 - utc1) / 1000) * 60 * 60 * 24);
}

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
