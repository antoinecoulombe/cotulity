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

export function dateDiffInDays(a: Date, b: Date) {
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor(((utc2 - utc1) / 1000) * 60 * 60 * 24);
}
