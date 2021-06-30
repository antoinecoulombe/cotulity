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
    Date.parse(
      localStorage.getItem('x-access-token-expiration') ??
        '01 Jan 1970 00:00:00 GMT'
    ) > Date.now()
  );
}
