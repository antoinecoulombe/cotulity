// Input format: 2021-08-18T08:26:21.000Z
// Input format: Mon, 09 Jan 2023 05:00:00 GMT
// Output format: 'DD/MM@HH:mm'
export const handleDate = (date: string | Date, only?: string): string => {
  if (!date || date === '/@:') return '/@:';

  let newDate = new Date(date);
  let dateString = `${newDate.getDate()}/${
    newDate.getMonth() + 1
  }@${newDate.getHours()}:${newDate.getMinutes()}`;

  if (only === 'date')
    dateString = dateString.substring(0, dateString.indexOf('@')) + '@:';
  else if (only === 'time')
    dateString = '/' + dateString.substring(dateString.indexOf('@'));

  return dateString;
};

export const getDateTime = (
  dateTime: string
): {
  day: string;
  month: string;
  hour: string;
  minute: string;
} => {
  try {
    let split = dateTime.split('@');
    var day: string, month: string, hour: string, minute: string;
    if (split[0].length > 1) {
      day = split[0].substring(0, split[0].indexOf('/'));
      month = split[0].substring(split[0].indexOf('/') + 1);
    } else {
      day = '';
      month = '';
    }

    if (split[1].length > 1) {
      hour = split[1].substring(0, split[1].indexOf(':'));
      minute = split[1].substring(split[1].indexOf(':') + 1);
    } else {
      hour = '';
      minute = '';
    }
    return { day: day, month: month, hour: hour, minute: minute };
  } catch (error) {
    return { day: '', month: '', hour: '', minute: '' };
  }
};

export const InputToDateTime = (
  e: any,
  field: string,
  date: string
): string | null => {
  var newDate: string = '';
  switch (field) {
    case 'day':
      if (e.target.value > 31) return null;
      newDate = e.target.value + date.substring(date.indexOf('/'));
      break;
    case 'month':
      if (e.target.value > 12) return null;
      newDate = date.substring(0, date.indexOf('/') + 1);
      newDate += e.target.value;
      newDate += date.substring(date.indexOf('@'));
      break;
    case 'hour':
      if (e.target.value > 23) return null;
      newDate = date.substring(0, date.indexOf('@') + 1);
      newDate += e.target.value;
      newDate += date.substring(date.indexOf(':'));
      break;
    case 'minute':
      if (e.target.value > 59) return null;
      newDate = date.substring(0, date.indexOf(':') + 1);
      newDate += e.target.value;
      break;
  }
  return newDate;
};
