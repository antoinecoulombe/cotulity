export function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isTomorrow(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() + 1 === d2.getDate()
  );
}

export function getDaysDiff(base: Date, toSubstract: Date) {
  let diffTime = Math.abs((base as any) - (toSubstract as any));
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return base < toSubstract ? -diffDays : diffDays;
}

export function getMonthAndDay(date: string) {
  let d = new Date(date);
  let dNow = new Date(Date.now());
  let dString = d.toDateString().split(' ');
  if (isSameDay(dNow, d)) return 'Today';
  if (isTomorrow(dNow, d)) return 'Tomorrow';
  return `${dString[1]} ${dString[2]}`;
}
