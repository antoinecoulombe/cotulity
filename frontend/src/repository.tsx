import axios from './fetchClient';

export function getNotifications() {
  return axios
    .get(`/notifications`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export function login(data) {
  return axios
    .post(`/auth/login`, {
      email: data.email,
      password: data.password,
    })
    .then((res) => {
      localStorage.setItem('x-access-token', res.data.token);
      localStorage.setItem(
        'x-access-token-expiration',
        (Date.now() + 2 * 60 * 60 * 1000).toString()
      );
      return res.data;
    })
    .catch((err) => {
      Promise.reject(err);
    });
}

export function logout() {
  localStorage.clear();
}

export function register(data) {
  return axios
    .post(`/users/register`, {
      email: data.email,
      password: data.password,
      firstname: data.firstname,
      lastname: data.lastname,
      phone: data.phone,
    })
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
