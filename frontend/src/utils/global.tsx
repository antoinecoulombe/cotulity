import _ from 'lodash';
import { useState } from 'react';
import { jsonNotification } from '../contexts/NotificationsContext';
import axios from './fetchClient';

export const getNotifications = (): Promise<jsonNotification[]> => {
  return axios
    .get(`/notifications`)
    .then((res) => res.data)
    .catch((err) => []);
};

export const isAuthenticated = (): boolean => {
  if (!localStorage.getItem('x-access-token')) return false;
  if (!localStorage.getItem('x-access-token-expiration')) return true;
  return (
    parseInt(localStorage.getItem('x-access-token-expiration') ?? '0') >
    Date.now()
  );
};

export const useForceUpdate = (): (() => void) => {
  const [value, setValue] = useState(0);
  return () => setValue((value) => value + 1);
};

export const getTranslateJSON = (
  translate: string,
  format: Array<string>
): string => {
  return `{"translate":"${translate}","format":["${format.join('","')}"]}`;
};

export const getCopyIndex = (
  array: any,
  where?: (...attr: any) => any
): { cp: any; i: number } => {
  let cp = _.cloneDeep(array);
  return { cp: cp, i: !where ? -1 : cp.findIndex(where) };
};

export const validateEmail = (email): boolean => {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
};

export const groupBy = function (xs, key) {
  return xs.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {});
};

// Input format: 2021-08-18T08:26:21.000Z
// Input format: Mon, 09 Jan 2023 05:00:00 GMT
// Output format: 'DD/MM@HH:mm'
export const handleDate = (date: string, only?: string): string => {
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
