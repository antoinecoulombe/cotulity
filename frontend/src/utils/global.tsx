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

export const getClosestNumber = (number: number, matches: number[]) => {
  if (!matches.length) return number;
  let minDiff = Math.abs(number - matches[0]);
  let closest = matches[0];

  for (let i = 1; i < matches.length; ++i) {
    let diff = Math.abs(number - matches[i]);
    if (diff < minDiff) {
      closest = matches[i];
      minDiff = diff;
    }
  }
  return closest;
};
