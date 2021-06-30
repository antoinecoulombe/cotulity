import axios from 'axios';

axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem(
  'x-access-token'
)}`;

// https://cors-anywhere.herokuapp.com/{type_your_url_here}
const BASE_URL = 'http://localhost:3000';
const TOKEN_EXPIRATION_H = 24;

export function getNotifications() {
  return axios
    .get(`${BASE_URL}/notifications`)
    .then((res) => res.data)
    .catch((err) => Promise.reject(err));
}

export function login(data) {
  return axios
    .post(`${BASE_URL}/auth/login`, {
      email: data.email,
      password: data.password,
    })
    .then((res) => {
      localStorage.setItem('x-access-token', res.data.token);
      localStorage.setItem(
        'x-access-token-expiration',
        (Date.now() + TOKEN_EXPIRATION_H * 60 * 60 * 1000).toString()
      );
      return res.data;
    })
    .catch((err) => {
      Promise.reject(err);
    });
}

export function register(data) {
  return axios
    .post(`${BASE_URL}/users/register`, {
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
