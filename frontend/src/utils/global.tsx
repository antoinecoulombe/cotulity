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
