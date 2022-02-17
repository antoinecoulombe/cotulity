export const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const isTomorrow = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() + 1 === d2.getDate()
  );
};

export const getDaysDiff = (base: Date, toSubstract: Date): number => {
  let diffTime = Math.abs((base as any) - (toSubstract as any));
  let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return base < toSubstract ? -diffDays : diffDays;
};

export const getMonthAndDay = (
  date: string
): { month: string; day: string } | string => {
  let d = new Date(date);
  let dNow = new Date(Date.now());
  let dString = d.toDateString().split(' ');
  if (isSameDay(dNow, d)) return 'date.today';
  if (isTomorrow(dNow, d)) return 'date.tomorrow';
  return {
    month: `date.month.${dString[1].toLowerCase()}`,
    day: dString[2].toString(),
  };
};
