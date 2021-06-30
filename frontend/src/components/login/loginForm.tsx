import React, { ComponentState, useEffect, useState } from 'react';
import $ from 'jquery';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getNotifications } from '../../repository';

import Input from '../forms/input';
import FormToggle from './formToggle';
import axios from '../../fetchClient';
import { useNotifications } from '../../contexts/NotificationsContext';

export default function LoginForm() {
  const { setNotification } = useNotifications();
  const [isLogin, setLogin] = useState(true);
  const [form, setForm] = useState({
    email: '',
    password: '',
    cpassword: '',
    phone: '',
    firstname: '',
    lastname: '',
  });

  useEffect(() => {
    handleLoad();
  }, []);

  function handleLoad() {
    $('.logo.big').animate({ opacity: 1 }, 400);

    setTimeout(() => {
      $('#container').animate({ width: 482 }, 400);

      $('.logo.big').animate({ opacity: 0.2 }, 750);
      setTimeout(() => {
        $('#login').animate({ opacity: 1 }, 300);
      }, 600);
    }, 900);
  }

  async function login() {
    return await axios
      .post(`/auth/login`, form)
      .then(async (res) => {
        localStorage.setItem('x-access-token', res.data.token);
        localStorage.setItem(
          'x-access-token-expiration',
          (Date.now() + 2 * 60 * 60 * 1000).toString()
        );

        const notifications = await getNotifications();
        setNotification(notifications);

        return res.data;
      })
      .catch((err) => {
        Promise.reject(err);
      });
  }

  function logout() {
    localStorage.clear();
  }

  async function register() {
    return axios
      .post(`/users/register`, form)
      .then((res) => res.data)
      .catch((err) => Promise.reject(err));
  }

  function handleToggleClick() {
    setLogin(!isLogin);
  }

  async function handleSubmit(event: any) {
    const res = isLogin ? await login() : await register();
  }

  return (
    <form id="login" onSubmit={(event) => handleSubmit(event)}>
      <Input
        name={'email'}
        type={'email'}
        value={form.email}
        onChange={(e: any) => setForm({ ...form, email: e.target.value })}
      />
      <Input
        name={'password'}
        type={'password'}
        value={form.password}
        onChange={(e: any) => setForm({ ...form, password: e.target.value })}
      />

      <FontAwesomeIcon
        icon="arrow-alt-circle-right"
        className="submit"
        onClick={handleSubmit}
      ></FontAwesomeIcon>

      <Input
        name={'phone'}
        type={'phone'}
        value={form.phone}
        classes={['signup']}
        onChange={(e: any) => setForm({ ...form, password: e.target.value })}
      />
      <Input
        name={'cpassword'}
        type={'password'}
        value={form.cpassword}
        classes={['signup']}
        onChange={(e: any) => setForm({ ...form, password: e.target.value })}
      />
      <Input
        name={'firstname'}
        type={'text'}
        value={form.firstname}
        classes={['signup']}
        onChange={(e: any) => setForm({ ...form, password: e.target.value })}
      />
      <Input
        name={'lastname'}
        type={'text'}
        value={form.lastname}
        classes={['signup']}
        onChange={(e: any) => setForm({ ...form, password: e.target.value })}
      />

      <FormToggle login={isLogin} onClick={handleToggleClick} />
    </form>
  );
}
