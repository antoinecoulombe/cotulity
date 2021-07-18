import _ from 'lodash';
import { useState } from 'react';
import axios from './fetchClient';

export function getNotifications() {
  return axios
    .get(`/notifications`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export function isAuthenticated() {
  return (
    localStorage.getItem('x-access-token') &&
    parseInt(localStorage.getItem('x-access-token-expiration') ?? '0') >
      Date.now()
  );
}

export function useForceUpdate() {
  const [value, setValue] = useState(0);
  return () => setValue((value) => value + 1);
}

export function getTranslateJSON(translate: string, format: Array<string>) {
  return `{"translate":"${translate}", "format": ["${format.join('","')}"]}`;
}

export function getCopyIndex(array: any, where?: (...attr: any) => any) {
  let cp = _.cloneDeep(array);
  if (where == null) return { cp: cp };

  const i = cp.findIndex(where);
  return i >= 0 ? { cp: cp, i: i } : null;
}
